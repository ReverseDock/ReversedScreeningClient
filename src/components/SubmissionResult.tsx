import React, { RefCallback, useCallback, useEffect } from 'react'
import axios from 'axios'
import { Card, IToaster, H3, HTMLTable, AnchorButton, Icon, Spinner, InputGroup, FormGroup, Callout, Button } from '@blueprintjs/core'
import { Row, Col } from "react-grid-system"

const ngl: any = require("ngl/dist/ngl")

interface IDockingResult {
    guid: string,
    receptorName: string,
    affinity: number,
    success: boolean,
    status: number,
    alphaFold: boolean
}

interface IProps {
    id: string,
    resultsResponseData: any,
    setLoading: Function,
    toaster: IToaster
}

enum ESorted {
    "asc",
    "desc",
    "none"
}

export default function SubmissionResult(props: IProps) {
    const [fileLoading, setFileLoading] = React.useState<boolean>(false);
    const [results, setResults] = React.useState<IDockingResult[]>([]);
    const [filteredResults, setFilteredResults] = React.useState<IDockingResult[]>([]);
    const [filter, setFilter] = React.useState<string>("");
    const [stage, setStage] = React.useState();
    const [page, setPage] = React.useState<number>(0);
    const perPage = 10;
    const [maxPages, setMaxPages] = React.useState<number>(10);
    const [viewSelected, setViewSelected] = React.useState<string>("");
    const [sorted, setSorted] = React.useState<ESorted>(ESorted.asc);

    useEffect(() => {
        var resultResponse: IDockingResult[] = props.resultsResponseData.dockingResults;
        setResults(resultResponse);
        setFilteredResults([...resultResponse].sort((a, b) => a.affinity - b.affinity));
        setMaxPages(Math.ceil(resultResponse.length / perPage))
    }, [props.resultsResponseData])

    const stageElementRef: RefCallback<HTMLElement> = useCallback((element) => {
        if (element) {
          const currentStage = new ngl.Stage(element, { backgroundColor: "white" });
          setStage(currentStage);
        }
      }, []);
    
    async function updateViewer(guid: string, receptorName: string, failed: boolean = false, alphaFold: boolean = false) {
        const schemeId = ngl.ColormakerRegistry.addScheme(function (this: any, params: any) {
            this.atomColor = function (atom: any) {
                if (atom.bfactor > 90) {
                return 0x0053D6; 
                } else if (atom.bfactor > 70) {
                return 0x65CBF3; 
                } else if (atom.bfactor > 50) {
                return 0xFFDB13; 
                } else {
                return 0xFF7D45;
                }
            };
            });
        
        // @ts-ignore: Object is possibly 'null'
        stage.removeAllComponents();
        setFileLoading(true);
        let receptor = null;
        if (alphaFold) {
            // @ts-ignore: Object is possibly 'null'
            receptor = await stage.loadFile(`${axios.defaults.baseURL}/submissions/${props.id}/receptors/${guid}/pdb`, {ext: "pdb", name: receptorName});
            receptor.addRepresentation("cartoon", {color: schemeId});
        } else {
            // @ts-ignore: Object is possibly 'null'
            receptor = await stage.loadFile(`${axios.defaults.baseURL}/submissions/${props.id}/receptors/${guid}/pdbqt`, {ext: "pdbqt", name: receptorName});
            receptor.addRepresentation("cartoon");
        }
        // receptor.addRepresentation("cartoon", {colorScheme: "bfactor", colorDomain: [50.00, 100.00], colorScale: ["red", "blue"]});
        if (!failed) {
            // @ts-ignore: Object is possibly 'null'
            var ligand = await stage.loadFile(`${axios.defaults.baseURL}/submissions/${props.id}/receptors/${guid}/modes`, {ext: "pdbqt", sele: "/0", name: "Ligand"});
            ligand.addRepresentation("licorice");
        }
        // @ts-ignore: Object is possibly 'null'
        stage.autoView();
        // @ts-ignore: Object is possibly 'null'
        stage.setFocus(0);
        setFileLoading(false);
        setViewSelected(receptorName);
    }

    function updateFilteredResults(newFilter: string = filter) {
            let filteredResultsNew = results.filter(val => val.receptorName.toLocaleLowerCase().includes(newFilter.toLocaleLowerCase()))
            setMaxPages(Math.ceil(filteredResultsNew.length / perPage))
            setPage(0)
            setFilteredResults(filteredResultsNew)
    }

    function testOnClick() {
        // @ts-ignore: Object is possibly 'null'
        stage.makeImage( {
            factor: 1,
            antialias: true,
            trim: false,
            transparent: false
        } ).then( function( blob: any ){
            ngl.download( blob, viewSelected + ".png" );
        } )
    }

    function sortResults(direction: ESorted) {
        setSorted(direction);
        setPage(0);
        switch(direction) {
            case ESorted.asc:
                setFilteredResults([...filteredResults].sort((a, b) => a.affinity - b.affinity));
                break;
            case ESorted.desc:
                setFilteredResults([...filteredResults].sort((a, b) => b.affinity - a.affinity));
                break;
            case ESorted.none:
                // Return to original results
                setFilteredResults(results);
                // Reapply filter
                updateFilteredResults(filter)
                break;
        }
    }

    return(
        <div>
            <Row nogutter style={{ marginBottom: "30px"}}>
                <Col md={5}>
                    <Card className="Viewer" elevation={1} style={{height: "auto", position: "relative"}}>
                        <H3> NGL Viewer </H3>
                        <Callout>View a result by clicking on the <Icon iconSize={16} icon="eye-open"/> icon next to a result.</Callout>
                        {results.some(val => val.alphaFold) &&
                            <Callout intent='primary'>AlphaFold prediction confidence levels of the structures of the submitted proteins are coloured as shown in the legend. 
                            Ligand docking poses at low confidence regions of the AlphaFold protein models should be interpreted with caution. Check the <a target='_blank' rel="noopener noreferrer" href="https://alphafold.ebi.ac.uk/faq#faq-5">AlphaFold FAQ</a> for more information.</Callout>
                        }
                        {fileLoading &&
                            <Spinner intent="primary" ></Spinner>
                        }
                        {results.some(val => val.alphaFold) &&
                            <div style={{position: "absolute",  bottom: "25px", right: "22px", zIndex: 30, padding: "4px", background: "white"}}>
                                <ul style={{listStyle:"none", paddingLeft: "0px", margin: '0px', fontSize: "12px"}}>
                                    <li><div style={{display: 'inline-block', width: "15px", height: "15px", background: "#0053D6", verticalAlign: "middle"}}></div> Very high (plDDT &gt; 90)</li>
                                    <li><div style={{display: 'inline-block', width: "15px", height: "15px", background: "#65CBF3", verticalAlign: "middle"}}></div> Confident (90 &ge; plDDT &gt; 70)</li>
                                    <li><div style={{display: 'inline-block', width: "15px", height: "15px", background: "#FFDB13", verticalAlign: "middle"}}></div> Low (70 &ge; plDDT &gt; 50)</li>
                                    <li><div style={{display: 'inline-block', width: "15px", height: "15px", background: "#FF7D45", verticalAlign: "middle"}}></div> Very low (50 &ge; plDDT)</li>
                                </ul>
                            </div>
                        }
                        {
                            viewSelected !== "" &&
                                <AnchorButton style={{position: "absolute",  bottom: "25px", left: "22px", zIndex: 30, background: "white"}} icon="camera" onClick={() => testOnClick()} outlined minimal> Screenshot</AnchorButton>
                        }
                        <div id="nglviewer" style={{width: "100%", height: "500px", border: "1px black solid"}} ref={stageElementRef}></div>
                    </Card>
                </Col>
                <Col md={7}>
                    <Card elevation={1} style={{ overflowY: "scroll"}}>
                        <H3> Results </H3>
                        <p>Note: Your results will be deleted after 30 days.</p>
                        <Row>
                            <Col md={6}>
                                <Callout>Download the pdbqt files by clicking on the <Icon iconSize={16} icon="download"/> icons. Switch pages by clicking
                                    on <Icon iconSize={16} icon="chevron-left"/> and <Icon iconSize={16} icon="chevron-right"/> icons below the table.</Callout>
                            </Col>
                            { results.filter(x => !x.success && x.affinity === -1).length > 0 &&
                                <Col md={6}>
                                    <Callout intent='primary'><b>{results.filter(x => !x.success && x.affinity === -1).length}</b> of <b>{results.length}</b> dockings failed.
                                    This might be due to a large search space. Check the last page of the table to find out which targets could not be docked.</Callout>
                                </Col>
                            }
                        </Row>
                        <div>
                            <FormGroup inline style={{display: "inline-block", marginRight: "20px"}}>
                                <InputGroup leftIcon="filter" value={filter} onChange={(event) => { setFilter(event.target.value); updateFilteredResults(event.target.value) }}></InputGroup>
                            </FormGroup>
                        </div>
                        <HTMLTable bordered striped width={"100%"}>
                            <thead>
                                <tr>
                                    <th>File name</th>
                                    <th style={{
                                        backgroundColor: sorted !== ESorted.none ? "#EEEEEE" : ""
                                    }}>Predicted <br/>binding energy [kcal/mol] 
                                    {
                                        sorted === ESorted.desc
                                        ?
                                            <Button minimal icon="chevron-up" onClick={() => sortResults(ESorted.asc)}></Button>
                                        :
                                            sorted === ESorted.asc
                                            ?
                                                <Button minimal icon="cross" onClick={() => sortResults(ESorted.none)}></Button>
                                            :
                                                <Button minimal icon="chevron-down" onClick={() => sortResults(ESorted.desc)}></Button>
                                    }
                                    </th>
                                    <th>View</th>
                                    <th>Predicted <br/>binding modes (pdbqt)</th>
                                    <th>Receptor (pdbqt)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.slice(page * perPage, page * perPage + perPage).map((value, idx) => {
                                    return(
                                        <tr key={idx}>
                                            <td>{value.receptorName ?? ""}</td>
                                            <td>{value.status === 3 ? (value.success ? value.affinity : (value.affinity !== -1 ? "Docking pending" : "Docking failed"))
                                                : (value.status === 0 ? "Too many amino acids in receptor" : "Error during docking preparation")}</td>
                                            <td><AnchorButton icon="eye-open" minimal disabled={value.status !== 3} onClick={() => updateViewer(value.guid, value.receptorName, !value.success, value.alphaFold)}></AnchorButton></td>
                                            <td><AnchorButton icon="download" minimal disabled={!value.success || value.status !== 3} href={`${axios.defaults.baseURL}/submissions/${props.id}/receptors/${value.guid}/modes`}></AnchorButton></td>
                                            <td><AnchorButton icon="download" minimal disabled={value.status !== 3} href={`${axios.defaults.baseURL}/submissions/${props.id}/receptors/${value.guid}/pdbqt`}></AnchorButton></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </HTMLTable>
                        <div>
                            <div style={{float: "left"}}>
                                <AnchorButton minimal icon="double-chevron-left" disabled={page === 0} onClick={() => setPage(0)}></AnchorButton>
                                <AnchorButton minimal icon="chevron-left" disabled={page === 0} onClick={() => setPage(Math.max(0, page - 1))}></AnchorButton>
                            </div>
                            <div style={{float: "right"}}>
                                <AnchorButton minimal icon="chevron-right" disabled={page === maxPages - 1} onClick={() => setPage(Math.min(maxPages - 1, page + 1))}></AnchorButton>
                                <AnchorButton minimal icon="double-chevron-right" disabled={page === maxPages - 1} onClick={() => setPage(maxPages - 1)}></AnchorButton>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Callout intent='warning' title='Caveats and Potential Pitfalls of Using ReverseDock'>
                        <b>Scoring Function Limitations: </b>Autodock Vina employs a scoring function to estimate binding energies. However, these estimates might not always align perfectly with experimental binding affinities. Users should approach numerical values with caution, as they might not accurately reflect absolute binding strength.
                        <br/>
                        <br/>
                        <b>Sampling Limitations: </b>The success of docking simulations relies heavily on the accuracy of generated conformations and the extent of conformational space sampling. Bigger ligand / protein targets may require more extensive sampling.
                        <br/>
                        <br/>
                        <b>Inaccurate Structures: </b>The reliability of docking results hinges on the precision of input protein and ligand structures. Structural errors, inaccuracies, or missing residues can impact the credibility of outcomes.
                        <br/>
                        <br/>
                        <b>Ligand Flexibility: </b>Autodock Vina can accommodate some degree of ligand flexibility. However, caution is advised when dealing with highly flexible ligands.
                    </Callout>
                </Col>
                <Col md={6}>
                    <Callout intent="primary" title="Directions to Assess Quality or Reliability of ReverseDock Outputs">
                        <b>Visual Inspection: </b>Employ molecular visualization software to scrutinize binding poses. Does the predicted binding mode align logically with protein-ligand interactions and steric considerations?
                        <br/>
                        <br/>
                        <b>Binding Site Consistency: </b>Compare predicted binding sites with known sites from experimental structures or literature. Do predicted sites correspond with established references?
                        <br/>
                        <br/>
                        <b>Redocking Experiments: </b>If feasible, execute redocking experiments using protein-ligand complexes with known structures.
                        <br/>
                        <br/>
                        <b>Consensus Scoring: </b>Consider utilizing alternative docking tools to validate results. When various tools concur on a specific binding mode, it bolsters confidence in the prediction.
                        <br/>
                        <br/>
                        <b>Binding Energies: </b>While binding energies might not be directly comparable to experimental values, comparing relative energies within a ligand set can offer insights into relative affinities.
                        <br/>
                        <br/>
                        <b>Validation with Literature: </b>Contrast your findings with existing literature on analogous protein-ligand systems. If your results align with established interactions, it enhances result credibility.
                        <br/>
                        <br/>
                        <b>Sensitivity Analysis: </b>Modify input parameters by using various amino acid mutations on your target to observe their impact on docking results. This aids in identifying consistent trends.
                        <br/>
                        <br/>
                        <b>Experimental Confirmation: </b>Whenever possible, validate predictions through experimental assays like binding assays or structure determination methods like X-ray crystallography or NMR spectroscopy.
                    </Callout>
                </Col>
            </Row>
        </div>
    )
}
