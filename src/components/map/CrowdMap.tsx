'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl, { Map as MlMap, Marker } from 'maplibre-gl';
import Supercluster from 'supercluster';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Lang } from '@/types';
import { MapSpot, STATUS_COLOR } from '@/lib/mapSpots';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
const SEOUL_CENTER: [number, number] = [126.985, 37.552];
/** Below this zoom only featured spots are shown. */
const DETAIL_ZOOM = 11.5;
/** From this zoom every spot shows its name label. */
const LABEL_ZOOM = 13;
// Base-map labels that add clutter (small road names, road-number shields, minor places).
const HIDDEN_LAYERS = [
  'highway-name-path',
  'highway-name-minor',
  'highway-shield-non-us',
  'highway-shield-us-interstate',
  'road_shield_us',
  'label_other',
];

interface Props {
  spots: MapSpot[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  userLocation: { lat: number; lng: number } | null;
  /** Fly to this point whenever `ts` changes. */
  focus: { lat: number; lng: number; zoom?: number; ts: number } | null;
  lang: Lang;
  /** Initial map centre [lng, lat]. */
  center?: [number, number];
  labels: { zoomIn: string; zoomOut: string; locate: string; cluster: string; estimate: string };
  onLocate: () => void;
  locating: boolean;
}

function labelExpression(lang: Lang): maplibregl.ExpressionSpecification {
  if (lang === 'ko') return ['coalesce', ['get', 'name:ko'], ['get', 'name']];
  return ['coalesce', ['get', `name:${lang}`], ['get', 'name:latin'], ['get', 'name']];
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function spotMarkerElement(spot: MapSpot, selected: boolean, showLabel: boolean, onSelect: (id: number) => void, estimate: string) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = `cep-marker${selected ? ' is-selected' : ''}`;
  el.style.setProperty('--c', STATUS_COLOR[spot.status]);
  el.setAttribute('aria-label', `${spot.name}, ${spot.score}/100${spot.isLive ? '' : ` (${estimate})`}`);
  el.setAttribute('aria-pressed', String(selected));
  el.innerHTML =
    `<span class="cep-marker-dot" aria-hidden="true">${spot.emoji}</span>` +
    (showLabel || selected ? `<span class="cep-marker-label">${escapeHtml(spot.name)}</span>` : '');
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onSelect(spot.id);
  });
  return el;
}

function clusterElement(count: number, label: string, onClick: () => void) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'cep-cluster';
  el.textContent = String(count);
  el.setAttribute('aria-label', label.replace('{n}', String(count)));
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });
  return el;
}

export default function CrowdMap({ spots, selectedId, onSelect, userLocation, focus, lang, center = SEOUL_CENTER, labels, onLocate, locating }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const userMarkerRef = useRef<Marker | null>(null);
  // Latest props for map event handlers registered once.
  const stateRef = useRef({ spots, selectedId, onSelect, labels });
  stateRef.current = { spots, selectedId, onSelect, labels };

  const renderMarkersRef = useRef<() => void>(() => {});
  renderMarkersRef.current = () => {
    const map = mapRef.current;
    if (!map) return;
    const { spots, selectedId, onSelect, labels } = stateRef.current;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const zoom = map.getZoom();
    // Spot markers hang from the point so the dot (34px, 46px when selected) is centred on it.
    const add = (el: HTMLElement, lng: number, lat: number, dotSize?: number) => {
      const options: maplibregl.MarkerOptions = dotSize
        ? { element: el, anchor: 'top', offset: [0, -dotSize / 2] }
        : { element: el, anchor: 'center' };
      const marker = new maplibregl.Marker(options).setLngLat([lng, lat]).addTo(map);
      if (el.classList.contains('is-selected')) marker.getElement().style.zIndex = '3';
      markersRef.current.push(marker);
    };
    const dot = (s: MapSpot) => (s.id === selectedId ? 46 : 34);

    const featured = spots.filter((s) => s.featured || s.id === selectedId);
    featured.forEach((s) => add(spotMarkerElement(s, s.id === selectedId, true, onSelect, labels.estimate), s.lng, s.lat, dot(s)));

    if (zoom < DETAIL_ZOOM) return;
    const others = spots.filter((s) => !s.featured && s.id !== selectedId);
    const index = new Supercluster<{ id: number }>({ radius: 56, maxZoom: 15 });
    index.load(others.map((s) => ({ type: 'Feature', properties: { id: s.id }, geometry: { type: 'Point', coordinates: [s.lng, s.lat] } })));
    const b = map.getBounds();
    const byId = new Map(others.map((s) => [s.id, s]));
    index.getClusters([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], Math.floor(zoom)).forEach((f) => {
      const [lng, lat] = f.geometry.coordinates;
      const props = f.properties as { cluster?: boolean; cluster_id?: number; point_count?: number; id?: number };
      if (props.cluster) {
        const expandTo = Math.min(index.getClusterExpansionZoom(props.cluster_id!), 16);
        add(clusterElement(props.point_count!, labels.cluster, () => map.easeTo({ center: [lng, lat], zoom: expandTo })), lng, lat);
      } else {
        const s = byId.get(props.id!);
        if (s) add(spotMarkerElement(s, false, zoom >= LABEL_ZOOM, onSelect, labels.estimate), s.lng, s.lat, dot(s));
      }
    });
  };

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center,
      zoom: 11,
      minZoom: 9,
      maxZoom: 17,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    mapRef.current = map;

    map.on('load', () => {
      // Calm base map: light-blue water, no clutter labels.
      if (map.getLayer('water')) map.setPaintProperty('water', 'fill-color', '#cfe4f5');
      if (map.getLayer('waterway')) map.setPaintProperty('waterway', 'line-color', '#cfe4f5');
      HIDDEN_LAYERS.forEach((id) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', 'none'));
      // Start collapsed; the (i) button still opens the required credits.
      containerRef.current?.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
      // First view: fit the featured spots.
      const featured = stateRef.current.spots.filter((s) => s.featured);
      if (featured.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        featured.forEach((s) => bounds.extend([s.lng, s.lat]));
        map.fitBounds(bounds, { padding: { top: 70, bottom: 50, left: 40, right: 70 }, maxZoom: 13, duration: 0 });
      }
      renderMarkersRef.current();
    });
    map.on('moveend', () => renderMarkersRef.current());
    map.on('error', (e) => console.warn('[map]', e.error?.message ?? e));

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Create once; the centre only sets the initial view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Base-map label language.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      map.getStyle().layers.forEach((layer) => {
        if (layer.type !== 'symbol' || HIDDEN_LAYERS.includes(layer.id)) return;
        const field = map.getLayoutProperty(layer.id, 'text-field');
        if (field && JSON.stringify(field).includes('name')) map.setLayoutProperty(layer.id, 'text-field', labelExpression(lang));
      });
    };
    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [lang]);

  // Re-render markers when data or selection changes.
  useEffect(() => {
    renderMarkersRef.current();
  }, [spots, selectedId, labels]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.flyTo({ center: [focus.lng, focus.lat], zoom: focus.zoom ?? Math.max(map.getZoom(), 13.5), speed: 1.4 });
  }, [focus]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    userMarkerRef.current?.remove();
    userMarkerRef.current = null;
    if (!userLocation) return;
    const el = document.createElement('div');
    el.className = 'cep-user-dot';
    el.setAttribute('aria-hidden', 'true');
    userMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat([userLocation.lng, userLocation.lat]).addTo(map);
  }, [userLocation]);

  const btn =
    'w-10 h-10 rounded-xl bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 cursor-pointer';

  return (
    <div className="relative w-full h-full">
      {/* Inline style: maplibre-gl.css sets .maplibregl-map { position: relative }, which would collapse a class-based inset. */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button type="button" className={btn} aria-label={labels.zoomIn} onClick={() => mapRef.current?.zoomIn()}>
          <span aria-hidden="true" className="text-xl leading-none">+</span>
        </button>
        <button type="button" className={btn} aria-label={labels.zoomOut} onClick={() => mapRef.current?.zoomOut()}>
          <span aria-hidden="true" className="text-xl leading-none">−</span>
        </button>
        <button type="button" className={`${btn} ${locating ? 'animate-pulse' : ''}`} aria-label={labels.locate} onClick={onLocate}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
