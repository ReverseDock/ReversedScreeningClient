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
                            Are you interested in finding out whether a ligand of choice binds to other proteins beyond the one it was designed for? Or do you want to know what is the target of your ligand in a particular biological process or cellular compartment?
                            </p>
                            <p>
                            ReverseDock allows you to submit the ligand (.mol2 format) and a list of target proteins (either via their <a target='_blank' rel="noopener noreferrer" href="https://www.uniprot.org/">UniProt</a> IDs or GO term-based filtered outputs of the <a target='_blank' rel="noopener noreferrer" href="http://amigo.geneontology.org/amigo/landing">AmiGO 2 tool</a>). Then, ReverseDock employs <a target='_blank' rel="noopener noreferrer" href="https://onlinelibrary.wiley.com/doi/full/10.1002/jcc.21334">AutoDock Vina</a> to dock the given ligand to the <a target='_blank' rel="noopener noreferrer" href="https://alphafold.ebi.ac.uk/">AlphaFold-predicted 3D structures</a> of the submitted proteins. The docking results are finally ranked by binding energies and visualised through an interactive graphical interface (from which they can be downloaded). Submissions are limited to maximum 1000 proteins shorter than 1000 amino acids.
                            </p>
                        </Col>
                    </Row>
                </Col>
                <Col md={4}>
                    <h3>Citation</h3>
                    <p><b>ReverseDock: A web server to dock a single ligand to multiple protein targets</b></p>

                    <p>Fabian Krause, Karsten Voigt, Barbara Di Ventura, Mehmet Ali Öztürk</p>
                </Col>
            </Row>
        </Container>
    )
}
