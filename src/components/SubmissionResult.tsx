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
    status: number
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
    const [sorted, setSorted] = React.useState<ESorted>(ESorted.none);

    useEffect(() => {
        var resultResponse: IDockingResult[] = props.resultsResponseData.dockingResults;
        setResults(resultResponse);
        setFilteredResults(resultResponse);
        setMaxPages(Math.ceil(resultResponse.length / perPage))
    }, [props.resultsResponseData])

    const stageElementRef: RefCallback<HTMLElement> = useCallback((element) => {
        if (element) {
          const currentStage = new ngl.Stage(element, { backgroundColor: "white" });
          setStage(currentStage);
        }
      }, []);
    
    async function updateViewer(guid: string, receptorName: string, failed: boolean = false) {
        // @ts-ignore: Object is possibly 'null'
        stage.removeAllComponents();
        setFileLoading(true);
        // @ts-ignore: Object is possibly 'null'
        var receptor = await stage.loadFile(`${axios.defaults.baseURL}/submissions/${props.id}/receptors/${guid}/pdbqt`, {ext: "pdbqt", name: receptorName});
        receptor.addRepresentation("cartoon");
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
                    <Card className="Viewer" elevation={1} style={{height: "625px", position: "relative"}}>
                        <H3> NGL Viewer </H3>
                        <Callout>View a result by clicking on the <Icon iconSize={16} icon="eye-open"/> icon next to a result.</Callout>
                        {fileLoading
                        ?
                            <Spinner intent="primary" ></Spinner>
                        :
                            null
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
                                            <td><AnchorButton icon="eye-open" minimal disabled={value.status !== 3} onClick={() => updateViewer(value.guid, value.receptorName, !value.success)}></AnchorButton></td>
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
        </div>
    )
}
