import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, Col, Container, Row } from "react-bootstrap";
import { Form } from "formik";

const Blank = () => (
  <React.Fragment>
    <Helmet title="Blank Page" />
    <Container fluid className="p-0">
      <h1 className="h3 mb-3">Blank Page</h1>

      {/*const [ligado, setLigado] = useState(false);*/}
      {/*const toggleLigado = () => setLigado(!ligado);}*/}

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title tag="h5" className="mb-0">
                <Form>
                  <div className="custom-control custom-switch">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="customSwitch1"
                    >
                      <label
                        className="custom-control-label"
                        htmlFor="customSwitch1"
                      >
                        Toggle this switch element
                      </label>
                    </input>
                  </div>
                </Form>
              </Card.Title>
            </Card.Header>
            <Card.Body>&nbsp;</Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  </React.Fragment>
);

export default Blank;
