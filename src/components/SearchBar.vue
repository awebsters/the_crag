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
    <input v-model="location" @blur="blurred" placeholder="Location" />
    <input v-model.number="radius" type="number" />
    <button @click="getUserLocation">
      <font-awesome-icon icon="fa-solid fa-compass"></font-awesome-icon>
    </button>
    <input v-model="range" placeholder="Range" />
    <button @click="handleSearch">Search</button>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref } from "vue";

import { reverse, search } from "../geocoding";
import * as types from "../types";
import router from "@/router";

const location: Ref<string> = ref("");
const radius: Ref<number> = ref(50);
const range: Ref<string> = ref("");
const errorMessage: Ref<string> = ref("");

// Non-reactive variables
var coords: types.Location | null = null;
var got_current_location = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function blurred() {
  await sleep(1000);
  console.log("blurred");
}

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
        got_current_location = true;
      },
      handleError
    );
  } else {
    errorMessage.value = "Geolocation is not supported by this browser.";
  }
};

async function handleSearch() {
  console.log("Searched");
  // TODO: This should redirect to a new page using a dymanic URL

  if (coords == null) {
    // We have not fetched location information
    // Lets try and use whats in the text box
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
  justify-content: space-around;
}

.search-box input,
button {
  margin: 8px; /* Adjust the margin for spacing between input elements */
  padding: 10px; /* Add padding for a cleaner look */
  border-radius: 10px;
  width: 100%;
}

.search-box button {
  margin: 8px;
  padding: 10px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  cursor: pointer;
  width: auto;
}
</style>
