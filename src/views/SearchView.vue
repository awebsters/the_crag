<template>
  <div v-for="document in documents" :key="document.id" class="document-box">
    <!-- Display title -->
    <h3>{{ document.name }}</h3>
    <!-- Display description -->
    <p>{{ document.description }}</p>
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
} from "firebase/firestore";
import { useFirestore } from "vuefire";
import { geohashQueryBounds, distanceBetween } from "geofire-common";
import * as types from "../types";

var documents: Ref<types.Route[]> = ref([]);

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
    documents.value.push({ ...doc.data(), id: count });
    count++;
  });
  console.log(documents.value);
}
</script>
