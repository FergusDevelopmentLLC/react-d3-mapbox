import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const initializeMap = ({ setMap, mapContainer, data, colorBreaks, aoiOutlineColor, highlightColor }) => {

  mapboxgl.accessToken = 'pk.eyJ1Ijoid2lsbGNhcnRlciIsImEiOiJjamV4b2g3Z2ExOGF4MzFwN3R1dHJ3d2J4In0.Ti-hnuBH8W4bHn7k6GCpGw'
  
  // let basemap = 'basic';
  // let basemap = 'streets';
  // let basemap = 'bright';
  let basemap = 'light'
  //let basemap = 'dark';
  // let basemap = 'satellite';

  const map = new mapboxgl.Map({
    container: mapContainer.current,
    style: `mapbox://styles/mapbox/${basemap}-v10`,
    center: [-119.84663447003527, 43.862206138711855],
    zoom: 5.839203767638953
  })

  map.addControl(new mapboxgl.NavigationControl())
  map.addControl(new mapboxgl.FullscreenControl())

  map.on("load", () => {

    setMap(map)
    
    map.resize()

    map.addSource('aoi', {
      type: 'geojson',
      data
    })

    let fc
    
    if(colorBreaks) {
      fc = []
      fc.push('step')
      fc.push(['get', 'popsqmi'])
      fc.push('rgba(0,0,0,0)')
      for(let colorBreak of colorBreaks) {
        fc.push(colorBreak.break)
        fc.push(`rgba(${colorBreak.rgb[0]}, ${colorBreak.rgb[1]}, ${colorBreak.rgb[2]},${colorBreak.rgb[3]})`)
      }  
    }
    else {
      fc = 'rgba(0,0,0,0)'
    }
    
    map.addLayer({
      id: 'aoi-solid-fill',
      source: 'aoi',
      type: 'fill',
      paint: {
        'fill-color': fc
      }
    })

    map.addLayer({
      id: 'aoi',
      source: 'aoi',
      type: 'line',
      paint: {
        'line-color': aoiOutlineColor,
      }
    })

    //lay down a transparent highlight line layer
    //by making alpha = 0
    map.addLayer({
      id: 'aoi-highlight',
      source: 'aoi',
      type: 'line',
      paint: {
        'line-color': highlightColor.replace(',1)',',0)'),//TODO: hack
        'line-width': 4,
        'line-dasharray': [1,1]
      }
    })

  })
}

//https://itnext.io/viewport-units-the-css-you-didnt-know-about-but-should-24b104483429
const styles = {
  width: "100vw",
  height: "100vh",
  top: 0,
  left: 0,
  position: "absolute"
}

export const MapboxGLMap = ({
  data,
  selectedId,
  colorBreaks,
  aoiOutlineColor = 'rgba(175,172,151,1)',
  highlightColor = 'rgba(255,102,0,1)'
}) => {

  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);
  
  useEffect(() => {
    
    if(map) {
      if (selectedId) {
        map.setPaintProperty('aoi-highlight', 'line-color', [
          'case',
          ['==', ['get', 'id'], selectedId],
          highlightColor,
          'rgba(0,0,0,0)'
        ])
      }
      else {
        map.setPaintProperty('aoi-highlight', 'line-color', 'rgba(0,0,0,0)')
      }
    }
    else {
      initializeMap({ setMap, mapContainer, data, colorBreaks, aoiOutlineColor, highlightColor })
    }

  }, [selectedId])

  return (
    <div 
      ref={mapContainer}
      style={styles}
      />
    )
}  