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
                            Our tool is primarily designed for experimental researchers who aim to conduct blind high-throughput docking with AutoDock Vina for their ligand (.mol2 file) and protein structures of choice. Users can either upload a maximum of 100 .pdb files, each containing fewer than 1000 amino acids,
                            or provide up to 100 <a href="https://www.uniprot.org/" rel="noopener noreferrer" target="_blank">UniProt</a> ids of structures predicted by <a href="https://alphafold.ebi.ac.uk/" rel="noopener noreferrer" target="_blank">AlphaFold</a>, also limited to 1000 amino acids.
                            </p>
                        </Col>
                    </Row>
                </Col>
                <Col md={4}>
                    <h3>Citation</h3>
                    <p><b>ReverseDock: A Web Server for Blind Docking of a Single Ligand to Multiple Protein Targets Using AutoDock Vina</b></p>

                    <p>Fabian Krause, Karsten Voigt, Barbara Di Ventura, Mehmet Ali Öztürk</p>
                </Col>
            </Row>
        </Container>
    )
}
