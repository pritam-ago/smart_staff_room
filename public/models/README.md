This folder should contain face-api.js model files.

Typical files required:

- tiny_face_detector_model-weights_manifest.json and related .bin shard files
- face_landmark_68_model-weights_manifest.json and related .bin shard files
- face_recognition_model-weights_manifest.json and related .bin shard files

You can download them from the face-api.js repository's `weights/` directory or copy a prepared `models` folder into this directory.

Run `npm run download-models` to fetch the manifest files (you may still need the .bin shards).
