import { Container, Col, Row } from "react-grid-system";

export default function Impressum() {
    return (
        <Container>
            <Row>
                <Col>
                    <p style={{marginTop: "20px"}}><b>ReverseDock can only be used for academic purposes.</b></p>
                    <h1>Impressum:</h1>
                    <p><b>Herausgeber*in</b></p>
                    <p>Albert-Ludwigs-Universität Freiburg</p>
                    <br />
                    <p><b>Anschrift</b></p>
                    <p>AG Di Ventura / Fakultät für Biologie</p>
                    <p>Schänzlestraße 1</p>
                    <p>79104 Freiburg</p>
                    <br />
                    <p><b>Kontakt</b></p>
                    <p>Barbara Di Ventura</p>
                    <p>Telefon: 0761 / 203 2764</p>
                    <p>barbara.diventura@biologie.uni-freiburg.de</p>
                    <a href="https://diventura.biologie.uni-freiburg.de/">https://diventura.biologie.uni-freiburg.de/</a>
                </Col>
            </Row>
        </Container>
    )
}