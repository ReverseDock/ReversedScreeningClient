import { Container, Row, Col } from "react-grid-system"
import submit from "./assets/submit.png"
import proteins from "./assets/proteins.png"
import goterm from "./assets/goterm.png"
import customdl from "./assets/customdl.png"
import feedback from "./assets/feedback2.png"
import submit2 from "./assets/submit2.png"
import status from "./assets/status.png"
import ngl from "./assets/ngl.png"
import table from "./assets/table.png"
import { Card, Divider, H2, H4, H5, Icon} from "@blueprintjs/core";
import { Link } from "react-router-dom";

export default function Tutorial() {
    return (
        <Container className="Tutorial">
            <H2>ReverseDock Tutorial</H2>
            <Card>
                <Row>
                    <Col md={6}>
                        <img alt="" src={submit} style={{width: "100%", height: "auto"}}></img>
                    </Col>
                    <Col md={6} style={{marginTop: "20px"}}>
                        <H4>Step 1: Upload Ligand</H4>
                        <p>On the <Link to="/submit">Submit</Link> page,
                        select the ligand (in .mol2 format) that you would like to use for docking.
                        If your ligand is in different file format than .mol2 you can use <a rel="noopener noreferrer" target="_blank" href="https://www.cheminfo.org/Chemistry/Cheminformatics/FormatConverter/index.html">Open Babel</a> to convert it to .mol2 file. Click "Next" to proceed to the next step, where you will select target proteins.</p>
                    </Col>
                </Row>
            </Card>
            <Card style={{marginTop: "20px"}}>
                <Row >
                    <Col md={6}>
                        <img alt="" src={proteins} style={{width: "100%", height: "auto"}}></img>
                    </Col>
                    <Col md={6} style={{marginTop: "20px"}}>
                        <H4>Step 2: Select Target Proteins</H4>
                        <p>You have two options to upload up to 1000 target proteins that are smaller than 1000 amino acids. To provide a list of UniProt IDs, check step 2a.
                            To select targets by using GO term, check step 2b.
                        </p>
                    </Col>
                </Row>
                <Divider/>
                <Row style={{marginTop: "10px"}}>
                    <Col md={6}>
                        <H5>Step 2a: By UniProtIds</H5>
                        <p>Upload a text file containing one UniProt ID per line, like shown in the example below.</p>
                        <Card style={{maxHeight: "200px", overflow: "scroll", padding: "10px"}}>
                            <p style={{marginBottom: "2px"}}>Q2ABC9</p>	
                            <p style={{marginBottom: "2px"}}>Q2ABA0</p>	
                            <p style={{marginBottom: "2px"}}>Q2AB95</p>	
                            <p style={{marginBottom: "2px"}}>F7HKJ8</p>	
                            <p style={{marginBottom: "2px"}}>H9GQ40</p>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <H5>Step 2b: By GO term</H5>
                        <p>Go to the website <b><a rel="noopener noreferrer" target="_blank" href="http://amigo.geneontology.org/amigo/search/bioentity">AmiGO 2</a></b>
                        and filter results by your GO term as follows: </p>
                        <p style={{textAlign: 'center'}}><img alt="" src={goterm} style={{width: "300px", height: "auto"}}></img></p>
                        <p>You can also use additional filters such as the organism type or contributor. Once you define your target proteins, click "Custom DL" and then "Download".
                        </p>
                        <p style={{textAlign: 'center'}}>
                            <img alt="" src={customdl} style={{width: "200px", height: "auto"}}></img>
                        </p>
                        <p>Save the opened tab as a text file and upload it to ReverseDock.</p>
                    </Col>
                </Row>
                <Divider/>
                <Row style={{marginTop: "10px"}}>
                    <Col md={12}>
                        <p>After uploading either a list of UniProt IDs or the output from AmiGO 2, you will get feedback on how many of the proteins can be docked.
                        </p>
                        <p style={{textAlign: 'center'}}>
                            <img alt="" src={feedback} style={{width: "500px", height: "auto"}}></img>
                        </p>
                        <p>As you can see in this example, one of the proteins is too big for usage in ReverseDock. Proteins that are bigger than 1000 amino acids and from organisms currently not supported by the web server are ignored.
                        </p>
                        <p>You can either continue by clicking "Next", or try a different protein list file.</p>
                    </Col>
                </Row>
            </Card>
            <Card style={{marginTop: "20px"}}>
                <Row>
                    <Col md={6}>
                        <img alt="" src={submit2} style={{width: "100%", height: "auto"}}></img>
                    </Col>
                    <Col md={6} style={{marginTop: "20px"}}>
                        <H4>Step 3: Submit</H4>
                        <p>Optionally you can provide an email address to get notified once your submission has finished.</p>
                    </Col>
                </Row>
            </Card>
            <Card style={{marginTop: "20px"}}>
                <Row>
                    <Col md={3}>
                        <img alt="" src={status} style={{width: "100%", height: "auto"}}></img>
                    </Col>
                    <Col md={9} style={{marginTop: "20px"}}>
                        <H4>Step 4: Check Status</H4>
                        <p>After submitting, you will be forwarded to a page containing your submission status and, as soon as they are ready, your results. 
                        </p>
                        <p>Once your submission has started, you can also review its progress and view intermediate results.</p>
                        <p>It is recommended to bookmark the page for future use.</p>
                    </Col>
                </Row>
            </Card>
            <Card style={{marginTop: "20px"}}>
                <Row>
                    <Col md={4}>
                        <img alt="" src={table} style={{width: "100%", height: "auto"}}></img>
                        <img alt="" src={ngl} style={{width: "100%", height: "auto"}}></img>
                    </Col>
                    <Col md={8} style={{marginTop: "20px"}}>
                        <H4>Step 5: View Results</H4>
                        <p>You can view docking results in a table containing UniProt IDs, protein names and organism and calculated binding energies. You can also view the results in 3D by clicking on the <Icon icon="eye-open"></Icon> icon.
                        </p>
                        <p>To save the the visualization state as an image, you can click the "Screenshot" button on the molecular viewer. </p>
                        <p>Additionally, you can download docking results of each run, which includes top 5 docking poses (on viewer only the top docking pose is shown) and your target proteins by clicking  the <Icon icon="download"></Icon> icon.</p>
                        <p>Note: Your results will be deleted after 30 days.</p>
                    </Col>
                </Row>
            </Card>
        </Container>
    )
}