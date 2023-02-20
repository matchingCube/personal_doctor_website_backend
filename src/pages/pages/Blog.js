import React, { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { addDoc, collection } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { db, storage } from "../../config";
import {
  ref as ref_storage,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import avatar1 from "../../assets/img/avatars/avatar.jpg";

const PublicInfo = () => {
  const [previewImage, setPreviewImage] = useState(undefined);
  const [imgFile, setImgFile] = useState("");
  const [uploadPercent, setUploadPercent] = useState(0);
  const inputRef = useRef();
  const titleRef = useRef();
  const contentRef = useRef();
  const handleUpload = () => {
    inputRef.current?.click();
  };
  const selectFile = (e) => {
    setPreviewImage(URL.createObjectURL(e.target.files[0]));
    setImgFile(e.target.files[0]);
  };
  const submithandler = (e) => {
    if (!imgFile) {
      alert("Please choose an image file first!");
    } else if (!titleRef.current.value) {
      alert("Please type the title first!");
    } else if (!contentRef.current.value) {
      alert("Please type the content first!");
    } else {
      e.preventDefault();
      const storageRef = ref_storage(storage, `/blog_images/${imgFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imgFile);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadPercent(percent);
        },
        (err) => console.log(err),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
            console.log("Title: ", titleRef.current.value);
            console.log("Content: ", contentRef.current.value);
            console.log("Image URL: ", url);
            let today = new Date();
            let date =
              today.getMonth() +
              1 +
              "." +
              today.getDate() +
              "." +
              today.getFullYear();
            console.log("Date: ", date);
            const ref = collection(db, "blog_data");

            let data = {
              title: titleRef.current.value,
              content: contentRef.current.value,
              image: url,
              date: date,
            };

            try {
              const docRef = await addDoc(ref, data);
              console.log("Document written by ID: ", docRef.id);
            } catch (e) {
              console.log(e);
            }

            titleRef.current.value = "";
            contentRef.current.value = "";
          });
        }
      );
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title tag="h5" className="mb-0">
          Add Blog
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={submithandler}>
          <Row>
            <Col md="8">
              <Form.Group className="mb-3">
                <Form.Label htmlFor="inputTitle">Title</Form.Label>
                <Form.Control
                  ref={titleRef}
                  type="text"
                  id="inputTitle"
                  placeholder="Title"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="inputContent">Content</Form.Label>
                <Form.Control
                  ref={contentRef}
                  as="textarea"
                  rows="4"
                  id="inputContent"
                  placeholder="Write down the content of your blog"
                />
              </Form.Group>
            </Col>
            <Col md="4">
              <div className="text-center">
                <img
                  alt="Chris Wood"
                  src={previewImage ? previewImage : avatar1}
                  className="img-responsive mt-2"
                  width="90%"
                  height="160"
                />
                <div className="mt-2">
                  <input
                    ref={inputRef}
                    type="file"
                    id="imgUpload"
                    className="d-none"
                    onChange={selectFile}
                  />
                  <Button variant="primary" onClick={handleUpload}>
                    <FontAwesomeIcon icon={faUpload} /> Upload
                  </Button>
                </div>
                <small>Please upload an image for your blog post.</small>
                <div>{uploadPercent}% done</div>
              </div>
            </Col>
          </Row>

          <Button type="submit" variant="primary">
            Submit
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

const Blog = () => (
  <React.Fragment>
    <Helmet title="Settings" />
    <Container fluid className="p-0">
      <h1 className="h3 mb-3">Blog</h1>
      <Row>
        <Col md="12" xl="12">
          <PublicInfo />
        </Col>
      </Row>
    </Container>
  </React.Fragment>
);

export default Blog;
