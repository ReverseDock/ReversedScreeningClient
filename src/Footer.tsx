import './App.scss';
import unifreiburg from './assets/unifreiburg.png';
import cibss from './assets/cibss.svg';
import { Col, Row } from "react-grid-system";


function Footer() {

    return (
        <Row className="Footer">
            <Col></Col>
            <Col>
                <Row align="center">
                    <Col md={6}>
                        <a rel="noopener noreferrer" target="_blank" href="https://uni-freiburg.de/">
                            <img src={unifreiburg} alt="Uni Freiburg" style={{
                            maxWidth: "40%"
                            }}/>
                        </a>
                    </Col>
                    <Col md={6}>
                        <a rel="noopener noreferrer" target="_blank" href="https://www.cibss.uni-freiburg.de/">
                            <img src={cibss} alt="CIBSS" style={{
                            maxWidth: "80%"
                            }}/>
                        </a>
                    </Col>
                </Row>
            </Col>
            <Col></Col>
        </Row>
    )
}

export default Footer;