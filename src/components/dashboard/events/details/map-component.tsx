"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Event {
  id: number;
  publicId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location: string;
  locationCoords?: { lat: number; lon: number; displayName?: string } | null;
  capacity: number;
  status: "A_VENIR" | "EN_COURS" | "TERMINE" | "ANNULE";
  category: string;
  imageUrl?: string;
}

interface MapComponentProps {
  events: Event[];
  onEventClick: (eventPublicId: string) => void;
}

/**
 * Composant de carte Leaflet pour afficher les événements géolocalisés
 * avec marqueurs colorés selon le statut et popups informatifs
 */
export default function MapComponent({
  events,
  onEventClick,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  /**
   * Obtention de la couleur du marqueur selon le statut de l'événement
   */
  const getMarkerColor = (status: string) => {
    switch (status) {
      case "A_VENIR":
        return "#3b82f6"; // Bleu
      case "EN_COURS":
        return "#10b981"; // Vert
      case "TERMINE":
        return "#6b7280"; // Gris
      case "ANNULE":
        return "#ef4444"; // Rouge
      default:
        return "#6b7280"; // Gris par défaut
    }
  };

  /**
   * Création d'un marqueur personnalisé avec icône colorée
   */
  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  /**
   * Formatage de la date pour l'affichage dans les popups
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Obtention du texte du statut en français
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case "A_VENIR":
        return "À venir";
      case "EN_COURS":
        return "En cours";
      case "TERMINE":
        return "Terminé";
      case "ANNULE":
        return "Annulé";
      default:
        return status;
    }
  };

  /**
   * Création du contenu HTML pour les popups
   */
  const createPopupContent = (event: Event) => {
    const statusColor = getMarkerColor(event.status);

    return `
      <div class="popup-content" style="min-width: 250px; font-family: system-ui, sans-serif;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <div style="
            width: 12px;
            height: 12px;
            background-color: ${statusColor};
            border-radius: 50%;
          "></div>
          <span style="
            font-size: 12px;
            font-weight: 600;
            color: ${statusColor};
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">${getStatusText(event.status)}</span>
        </div>
        
        <h3 style="
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.3;
        ">${event.title}</h3>
        
        ${
          event.description
            ? `
          <p style="
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #6b7280;
            line-height: 1.4;
          ">${
            event.description.length > 100
              ? event.description.substring(0, 100) + "..."
              : event.description
          }</p>
        `
            : ""
        }
        
        <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #374151;">
            <span style="font-weight: 600;">📅</span>
            <span>${formatDate(event.startDate)}</span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #374151;">
            <span style="font-weight: 600;">📍</span>
            <span>${event.locationCoords?.displayName || event.location}</span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #374151;">
            <span style="font-weight: 600;">👥</span>
            <span>${event.capacity} participant${
      event.capacity > 1 ? "s" : ""
    }</span>
          </div>
        </div>
        
        <button 
          onclick="window.handleEventDetails('${event.publicId}')"
          style="
            width: 100%;
            padding: 8px 12px;
            background-color: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
          "
          onmouseover="this.style.backgroundColor='#2563eb'"
          onmouseout="this.style.backgroundColor='#3b82f6'"
        >
          Voir les détails
        </button>
      </div>
    `;
  };

  /**
   * Initialisation de la carte et ajout des marqueurs
   */
  useEffect(() => {
    if (!mapRef.current || events.length === 0) return;

    // Nettoyage des marqueurs existants
    markersRef.current.forEach((marker) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Calcul des bounds pour centrer la carte
    const bounds = L.latLngBounds([]);
    const validEvents = events.filter((event) => event.locationCoords);

    if (validEvents.length === 0) return;

    validEvents.forEach((event) => {
      if (event.locationCoords) {
        bounds.extend([event.locationCoords.lat, event.locationCoords.lon]);
      }
    });

    // Initialisation de la carte si elle n'existe pas
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: bounds.getCenter(),
        zoom: 10,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true,
      });

      // Ajout du fond de carte OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    // Ajout des marqueurs pour chaque événement
    validEvents.forEach((event) => {
      if (event.locationCoords) {
        const markerColor = getMarkerColor(event.status);
        const customIcon = createCustomIcon(markerColor);

        const marker = L.marker(
          [event.locationCoords.lat, event.locationCoords.lon],
          {
            icon: customIcon,
          }
        ).addTo(mapInstanceRef.current!);

        // Création et ajout du popup
        const popupContent = createPopupContent(event);
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: "custom-popup",
        });

        markersRef.current.push(marker);
      }
    });

    // Ajustement de la vue pour inclure tous les marqueurs
    if (validEvents.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    } else if (validEvents.length === 1) {
      mapInstanceRef.current.setView(bounds.getCenter(), 13);
    }

    // Ajout de la fonction globale pour gérer les clics sur les boutons des popups
    (window as any).handleEventDetails = onEventClick;

    // Nettoyage lors du démontage
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
      delete (window as any).handleEventDetails;
    };
  }, [events, onEventClick]);

  return (
    <div
      ref={mapRef}
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "8px",
      }}
    />
  );
}
