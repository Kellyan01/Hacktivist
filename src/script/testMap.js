import { MapGenerator } from "./map/MapGenerator.js";
import { MapRenderer } from "./map/MapRenderer.js";
import { LayeredMapGenerator } from "./map/LayeredMapGenerator.js";

function generateBSPMap(){
    //Generate Map
    const map = new MapGenerator(50,40,7,4);
    //launch the generation
    const root = map.generate();
    //Get the leaves
    map.getLeaves(root);
    //Place the room on map
    map.placeRoom();
    //Connection between Rooms
    map.connectRooms(root);

    //Display the root and the leaves tab
    console.log(root);
    console.log(map.leaves);
    console.log(map.mapNodes);
    console.log(map.connections);

    //Display in Browser
    const scale = 5;
    const svgEl = document.getElementById("map");
    svgEl.setAttribute("width", map.width * scale);
    svgEl.setAttribute("height", map.height * scale);

    const mapRenderer = new MapRenderer(svgEl,map.mapNodes,map.connections,scale,8);
    mapRenderer.render();
}

function generateLayerMap(){
    //Generate Map
    const map = new LayeredMapGenerator(50,40,1,5,15);
    //Generate the Layer
    map.generateMap();

    //Display in Console
    console.log(map);

    //Display in Browser
    const scale = 20;
    const svgEl = document.getElementById("map");
    svgEl.setAttribute("width", map.width * scale);
    svgEl.setAttribute("height", map.height * scale);

    const mapRenderer = new MapRenderer(svgEl,map.mapNodes,map.connections,scale,8);
    mapRenderer.render();
}

//Launch the map generator
generateLayerMap()