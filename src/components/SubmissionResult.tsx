import React, { RefCallback, useCallback, useEffect } from 'react'
import axios from 'axios'
import { Card, IToaster, H3, HTMLTable, AnchorButton, Icon, Spinner, InputGroup, FormGroup, Callout, Radio, RadioGroup } from '@blueprintjs/core'
import { Row, Col } from "react-grid-system"

const ngl: any = require("ngl/dist/ngl")

interface IDockingResult {
    guid: string,
    uniProtId: string,
    receptorName: string,
    affinity: number,
    receptorFASTA: string,
    success: boolean
}

interface IProps {
    id: string,
    resultsResponseData: any,
    setLoading: Function,
    toaster: IToaster
}

export default function SubmissionResult(props: IProps) {
    const [fileLoading, setFileLoading] = React.useState<boolean>(false);
    const [results, setResults] = React.useState<IDockingResult[]>([]);
    const [filteredResults, setFilteredResults] = React.useState<IDockingResult[]>([]);
    const [filter, setFilter] = React.useState<string>("");
    const [filterType, setFilterType] = React.useState<number>(0);
    const [stage, setStage] = React.useState();
    const [page, setPage] = React.useState<number>(0);
    const perPage = 10;
    const [maxPages, setMaxPages] = React.useState<number>(10);
    const [viewSelected, setViewSelected] = React.useState<string>("");

    useEffect(() => {
        console.log(props.resultsResponseData);
        var resultResponse: IDockingResult[] = props.resultsResponseData.dockingResults;
        resultResponse.sort((a, b) => a.affinity - b.affinity);
        setResults(resultResponse);
        setFilteredResults(resultResponse);
        setMaxPages(Math.ceil(resultResponse.length / perPage))
        var chartData: (string|number)[][] = [['FASTA', 'Affinity']];
        resultResponse.forEach((value, idx) => {
            chartData.push([value.uniProtId, value.affinity]);
        });
    }, [props.resultsResponseData])

    const stageElementRef: RefCallback<HTMLElement> = useCallback((element) => {
        if (element) {
          const currentStage = new ngl.Stage(element, { backgroundColor: "white" });
          setStage(currentStage);
        }
      }, []);
    
    async function updateViewer(guid: string, uniProtId: string, failed: boolean = false) {
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
        // @ts-ignore: Object is possibly 'null'
        var receptor = await stage.loadFile(`${axios.defaults.baseURL}/receptors/${uniProtId}/pdbqt`, {ext: "pdbqt", name: uniProtId});
        receptor.addRepresentation("cartoon", {color: schemeId});
        // receptor.addRepresentation("cartoon", {colorScheme: "bfactor", colorDomain: [50.00, 100.00], colorScale: ["red", "blue"]});
        if (!failed) {
            // @ts-ignore: Object is possibly 'null'
            var ligand = await stage.loadFile(`${axios.defaults.baseURL}/submissions/${props.id}/results/${guid}`, {ext: "pdbqt", sele: "/0", name: "Ligand"});
            ligand.addRepresentation("licorice");
        }
        // @ts-ignore: Object is possibly 'null'
        stage.autoView();
        // @ts-ignore: Object is possibly 'null'
        stage.setFocus(0);
        setFileLoading(false);
        setViewSelected(uniProtId);
    }

    function onFilter(type: number) {
        setFilterType(type);
        updateFilteredResults(type);
    }

    function updateFilteredResults(type: number = filterType, newFilter: string = filter) {
        if (type === 0) {
            let filteredResultsNew = results.filter(val => val.uniProtId.toLocaleLowerCase().includes(newFilter.toLocaleLowerCase()))
            setMaxPages(Math.ceil(filteredResultsNew.length / perPage))
            setPage(0)
            setFilteredResults(filteredResultsNew)
        }
        else {
            let filteredResultsNew = results.filter(val => val.receptorName.toLocaleLowerCase().includes(newFilter.toLocaleLowerCase()))
            setMaxPages(Math.ceil(filteredResultsNew.length / perPage))
            setPage(0)
            setFilteredResults(filteredResultsNew)
        }
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

    return(
        <div>
            <Row nogutter style={{ marginBottom: "30px"}}>
                <Col md={5}>
                    <Card className="Viewer" elevation={1} style={{height: "740px", position: "relative"}}>
                        <H3> NGL Viewer </H3>
                        <Callout>View a result by clicking on the <Icon iconSize={16} icon="eye-open"/> icon next to a result.</Callout>
                        <Callout intent='primary'>AlphaFold prediction confidence levels of the structures of the submitted proteins are coloured as shown in the legend. 
                        Ligand docking poses at low confidence regions of the AlphaFold protein models should be interpreted with caution. Check the <a target='_blank' rel="noopener noreferrer" href="https://alphafold.ebi.ac.uk/faq#faq-5">AlphaFold FAQ</a> for more information.</Callout>
                        {fileLoading
                        ?
                            <Spinner intent="primary" ></Spinner>
                        :
                            null
                        }
                        <div style={{position: "absolute",  bottom: "25px", right: "22px", zIndex: 30, padding: "4px", background: "white"}}>
                            <ul style={{listStyle:"none", paddingLeft: "0px", margin: '0px', fontSize: "12px"}}>
                                <li><div style={{display: 'inline-block', width: "15px", height: "15px", background: "#0053D6", verticalAlign: "middle"}}></div> Very high (plDDT &gt; 90)</li>
                                <li><div style={{display: 'inline-block', width: "15px", height: "15px", background: "#65CBF3", verticalAlign: "middle"}}></div> Confident (90 &ge; plDDT &gt; 70)</li>
                                <li><div style={{display: 'inline-block', width: "15px", height: "15px", background: "#FFDB13", verticalAlign: "middle"}}></div> Low (70 &ge; plDDT &gt; 50)</li>
                                <li><div style={{display: 'inline-block', width: "15px", height: "15px", background: "#FF7D45", verticalAlign: "middle"}}></div> Very low (50 &ge; plDDT)</li>
                            </ul>
                        </div>
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
                            { results.filter(x => !x.success).length > 0 &&
                                <Col md={6}>
                                    <Callout intent='primary'><b>{results.filter(x => !x.success).length}</b> of <b>{results.length}</b> dockings failed.
                                    This might be due to a large search space. Check the last page of the table to find out which targets could not be docked.</Callout>
                                </Col>
                            }
                        </Row>
                        <div>
                            <FormGroup inline style={{display: "inline-block", marginRight: "20px"}}>
                                <InputGroup leftIcon="filter" value={filter} onChange={(event) => { setFilter(event.target.value); updateFilteredResults(filterType, event.target.value) }}></InputGroup>
                            </FormGroup>
                            <RadioGroup className='inline-block' onChange={(event) => onFilter(Number(event.currentTarget.value))} selectedValue={filterType} inline>
                                <Radio label="UniProtId" value={0}></Radio>
                                <Radio label="Name" value={1}></Radio>
                            </RadioGroup>
                        </div>
                        <HTMLTable bordered striped width={"100%"}>
                            <thead>
                                <tr>
                                    <th>UniProtId</th>
                                    <th>Protein name and organism</th>
                                    <th>Predicted <br/>binding energy [kcal/mol] </th>
                                    <th>View</th>
                                    <th>Predicted <br/>binding modes (pdbqt)</th>
                                    <th>AlphaFold <br/>prediction (pdbqt)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.slice(page * perPage, page * perPage + perPage).map((value, idx) => {
                                    return(
                                        <tr key={idx}>
                                            <td>{value.uniProtId}</td>
                                            <td>{value.receptorName ?? ""}</td>
                                            <td>{value.success ? value.affinity : "Docking failed"}</td>
                                            <td><AnchorButton icon="eye-open" minimal onClick={() => updateViewer(value.guid, value.uniProtId, !value.success)}></AnchorButton></td>
                                            <td><AnchorButton icon="download" minimal disabled={!value.success} href={`${axios.defaults.baseURL}/submissions/${props.id}/results/${value.guid}`}></AnchorButton></td>
                                            <td><AnchorButton icon="download" minimal href={`${axios.defaults.baseURL}/receptors/${value.uniProtId}/pdbqt`}></AnchorButton></td>
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
        </div>
    )
}
