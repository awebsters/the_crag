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
    <button @click="getUserLocation">
      <i class="fa fa-compass" style="font-size: 15px"></i>
    </button>
    <input v-model="range" placeholder="Range" />
    <button @click="handleSearch">Search</button>
  </div>
  <div v-for="document in documents" :key="document.id" class="document-box">
    <!-- Display title -->
    <h3>{{ document.name }}</h3>
    <!-- Display description -->
    <p>{{ document.description }}</p>
  </div>
</template>
<script lang="ts" setup>
import { ref, Ref } from "vue";
import { useFirestore } from "vuefire";
import {
  query,
  getDocs,
  orderBy,
  startAt,
  endAt,
  collectionGroup,
} from "firebase/firestore";
import { geohashQueryBounds, distanceBetween } from "geofire-common";
import { reverse } from "../geocoding";
import * as types from "../types";

const db = useFirestore();

const location: Ref<string> = ref("");
const radius: Ref<number> = ref(50);
const range: Ref<string> = ref("");
const errorMessage: Ref<string> = ref("");
var documents: Ref<types.Route[]> = ref([]);

// Non-reactive variables
var coords: types.Location | null = null;

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  } else {
    errorMessage.value = "Geolocation is not supported by this browser.";
  }
};

// eslint-disable-next-line
async function handleSuccess(position: GeolocationPosition) {
  coords = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  let readable_location = await reverse(
    position.coords.latitude,
    position.coords.longitude
  );
  location.value =
    readable_location["address"]["city"] +
    " " +
    readable_location["address"]["state"];
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

async function handleSearch() {
  console.log("Search button clicked!");
  console.log("Range:", range.value);

  if (coords == null) {
    return;
  }
  const radius_meters = radius.value * 1000;

  var bounds = geohashQueryBounds(
    [coords.latitude, coords.longitude],
    radius_meters
  );

  console.log("bounds");
  console.log(bounds);
  const promises = [];
  for (const b of bounds) {
    const q = query(
      collectionGroup(db, "areas"),
      orderBy("geohash"),
      startAt(b[0]),
      endAt(b[1])
    );

    promises.push(getDocs(q));
  }

  // Collect all the query results together into a single list
  const snapshots = await Promise.all(promises);

  const matchingDocs = [];
  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const clat = doc.get("latitude");
      const clng = doc.get("longitude");

      // We have to filter out a few false positives due to GeoHash
      // accuracy, but most will match
      const distanceInKm = distanceBetween(
        [clat, clng],
        [coords.latitude, coords.longitude]
      );
      const distanceInM = distanceInKm * 1000;
      if (distanceInM <= radius_meters) {
        matchingDocs.push(doc);
      }
    }
  }

  let count = 0;
  documents.value = [];
  matchingDocs.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    documents.value.push({ ...doc.data(), id: count });
    count++;
  });

  console.log(documents.value);
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
