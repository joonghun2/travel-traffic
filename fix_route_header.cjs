const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');
let routeHtml = fs.readFileSync('route.html', 'utf8');

let navRegex = /<nav id="navbar">[\s\S]*?<\/nav>/;
let indexNavMatch = indexHtml.match(navRegex);

if (indexNavMatch) {
    let newNav = indexNavMatch[0];
    
    // Replace route.html's nav
    if (routeHtml.match(navRegex)) {
        routeHtml = routeHtml.replace(navRegex, newNav);
    } else {
        // Fallback for route.html if it doesn't have <nav id="navbar"> yet
        let oldNavRegex = /<header class="header">\s*<a href="index\.html" class="logo">[\s\S]*?<\/nav>/;
        routeHtml = routeHtml.replace(oldNavRegex, `<header class="header">\n        ${newNav}`);
    }
    
    fs.writeFileSync('route.html', routeHtml, 'utf8');
    console.log("Successfully synced route.html header with index.html.");
} else {
    console.log("Could not find <nav id='navbar'> in index.html.");
}
