# Weather App (React + Vite)

A beginner-friendly weather app that fetches current conditions from OpenWeather.

## Tech
- React (Vite), Fetch API, Environment variables, LocalStorage
- Deployed to Vercel

## Setup
1. `npm install`
2. Create `.env.local` with `VITE_OPENWEATHER_API_KEY=YOUR_KEY`
3. `npm run dev`

## Deploy
- Add `VITE_OPENWEATHER_API_KEY` to Vercel Project → Settings → Environment Variables
- Redeploy

# Weather App

A modern weather application built with **React** and the **OpenWeather API**.  
Search for cities, view real-time weather, check a 5-day forecast, and use your device’s location to get local conditions — all in a clean, dark-themed interface.

---

## Features

- **City Search with Autocomplete**  
  Start typing and get live suggestions with **City, State, Country**.

- **Geolocation Support**  
  Fetch weather for your **current location**.

- **Current Conditions**  
  Temperature, feels like, humidity, wind, min/max, and weather description.

- **5-Day Forecast**  
  Daily conditions with icons, temperature, and descriptions.

- **Unit Toggle**  
  Switch between **°F (imperial)** and **°C (metric)**.

- **Recent Searches**  
  Save your last 5 searches and reload them with one click.

- **Local Storage**  
  Remembers your **last city** and **unit preference** even after closing the app.

- ⚡ **Error Handling**  
  User-friendly messages for:
  - Invalid API key
  - Rate limiting (429 errors)
  - Location denied or unavailable

---

## Tech Stack

- **React** (Vite)
- **JavaScript (ES6+)**
- **CSS** (custom dark theme)
- **OpenWeather API**  
  - Current Weather (`/weather`)  
  - 5-Day Forecast (`/forecast`)  
  - Geocoding for autocomplete (`/geo/1.0/direct`)
- **LocalStorage** for persistence

---

## Project Structure

