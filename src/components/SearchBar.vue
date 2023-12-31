<template>
  <div class="top-bar">
    <img
      alt="Vue logo"
      src="../assets/TheCragIcon.png"
      width="100"
      height="100"
    />
    <h1>Welcome to The Crag</h1>
  </div>
  <div>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
  <div class="search-box">
    <input v-model="location" placeholder="Location" />
    <input v-model.number="radius" type="number" />
    <input v-model="range" placeholder="Range" />
    <button @click="handleSearch">Search</button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref } from "vue";

import { reverse, search } from "../geocoding";
import * as types from "../types";
import router from "@/router";

const location: Ref<string> = ref("");
const radius: Ref<number> = ref(50);
const range: Ref<string> = ref("");
const errorMessage: Ref<string> = ref("");

// Non-reactive variables
var coords: types.Location | null = null;
var users_location: string | null = null;

onMounted(() => {
  getUserLocation();
});

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      // eslint-disable-next-line
      async (position: GeolocationPosition) => {
        coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        let readable_location = await reverse(
          coords.latitude,
          coords.longitude
        );
        location.value =
          readable_location["address"]["city"] +
          " " +
          readable_location["address"]["state"];

        users_location = location.value;
      },
      handleError
    );
  } else {
    errorMessage.value = "Geolocation is not supported by this browser.";
  }
};

async function handleSearch() {
  console.log("Searched");

  if (coords == null || location.value != users_location) {
    // We have either not fetched location information
    // Or the user has inputted a customer location we must use

    let api_coords = await search(location.value);
    coords = {
      latitude: Number(api_coords[0]["lat"]),
      longitude: Number(api_coords[0]["lon"]),
    };
  }

  router.push({
    name: "search",
    params: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      radius: radius.value,
    },
  });
}

// eslint-disable-next-line
const handleError = (error: GeolocationPositionError) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.log("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.log("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.log("An unknown error occurred while fetching user location.");
      break;
    default:
      console.log("An error occurred while fetching user location.");
      break;
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.top-bar {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
}
.top-bar img {
  border-radius: 50px;
  margin: 10px;
}

.search-box {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
}

.search-box input,
button {
  margin: 8px; /* Adjust the margin for spacing between input elements */
  padding: 10px; /* Add padding for a cleaner look */
  border-radius: 10px;
}

.search-box button {
  margin: 8px;
  padding: 10px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  cursor: pointer;
}
</style>
