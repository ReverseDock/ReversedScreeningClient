import { Container, Row, Col } from "react-grid-system"

export default function Home() {
    return (
        <Container className="Home">
            <Row>
                <Col md={8}>
                    
                    <Row>
                        <Col xl={7}>
                            <h1>Welcome to ReverseDock!</h1>
                            <p>
                            Our tool is primarily designed for experimental researchers who aim to conduct blind high-throughput docking with AutoDock Vina for their ligand (.mol2 file) and protein structures of choice. Users can upload a maximum of 100 .pdb files, each containing fewer than 1000 amino acids.
                            </p>
                        </Col>
                    </Row>
                </Col>
                <Col md={4}>
                    <h3>Citation</h3>
                    <p><b>ReverseDock: An AutoDock Vina-based blind docking web server for docking a single ligand to multiple protein targets</b></p>

                    <p>Fabian Krause, Karsten Voigt, Barbara Di Ventura, Mehmet Ali Öztürk</p>
                </Col>
            </Row>
        </Container>
    )
}
