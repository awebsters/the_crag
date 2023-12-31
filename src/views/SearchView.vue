<template>
  <div v-for="document in documents" :key="document.id" class="document-box">
    <div class="image-container">
      <img src="../assets/missing_image.jpeg" />
    </div>
    <div class="text-container">
      <h3>{{ document.name }}</h3>
      <h3 class="distance">{{ document.distance }} km</h3>
      <p>{{ document.description }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref } from "vue";
import { useRoute } from "vue-router";
import {
  query,
  getDocs,
  orderBy,
  startAt,
  endAt,
  collectionGroup,
  limit,
} from "firebase/firestore";
//import { limitToFirst, query } from "firebase/database";
import { useFirestore } from "vuefire";
import { geohashQueryBounds, distanceBetween } from "geofire-common";
import * as types from "../types";
import { getDistanceFromLatLonInKm } from "../geocoding";

var documents: Ref<types.Area[]> = ref([]);

const route = useRoute();
const db = useFirestore();

onMounted(() => {
  fetch_routes();
});

async function fetch_routes() {
  console.log("fetching");
  const latitude = Number(route.params.latitude);
  const longitude = Number(route.params.longitude);
  const radius_meters = Number(route.params.radius) * 1000;

  var bounds = geohashQueryBounds([latitude, longitude], radius_meters);

  const promises = [];
  for (const b of bounds) {
    const q = query(
      collectionGroup(db, "areas"),
      orderBy("geohash"),
      startAt(b[0]),
      endAt(b[1]),
      limit(5)
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
      const distanceInKm = distanceBetween([clat, clng], [latitude, longitude]);
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
    const data = doc.data();
    const distance = getDistanceFromLatLonInKm(
      data.latitude,
      data.longitude,
      latitude,
      longitude
    );

    documents.value.push({ ...data, id: count, distance: distance });
    count++;
  });
  console.log(documents.value);
}
</script>

<style scoped>
.document-box {
  display: flex;
  flex-direction: row;
  align-items: start;
  text-align: left;
  width: auto;
  height: 300px;
  background-color: #f5f5f5; /* Light background color */
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1); /* Subtle box shadow */
  border-radius: 8px; /* Optional: Add border radius for rounded corners */
  margin-bottom: 20px;
}

.image-container {
  flex: 1;
  max-width: 20%;
  height: 100%;
  margin: 5px;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
}
.text-container {
  flex: 2;
  position: relative;
  margin: 10px;
}

.distance {
  position: absolute;
  top: 0px;
  right: 0px;
}
</style>
