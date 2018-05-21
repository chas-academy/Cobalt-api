import axios from "axios";
import cloudinary from "cloudinary";

export default function middleware(req, res) {
  cloudinary.uploader
    .upload_stream(result => {
      axios({
        url: "/upload",
        method: "POST",
        data: {
          url: result.secure_url
        }
      })
        .then(res => {
          res.status(200).json(res.data.data);
        })
        .catch(err => {
          res.status(500).json(err.res.data);
        });
    })
    .end(req.file.buffer);
}
