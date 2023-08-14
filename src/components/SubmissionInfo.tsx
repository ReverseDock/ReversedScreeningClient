import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { AnchorButton, Card, H3, H4, HTMLTable, IToaster, ProgressBar} from '@blueprintjs/core';
import { useHistory, useLocation } from "react-router-dom";
import { Col, Container, Row } from "react-grid-system";
import SubmissionResult from "./SubmissionResult";
import SubmissionStatus from "./SubmissionStatus";
import qs from 'qs';

function SubmissionProgress(props: {progress: number}) {
    return (
        <div>
            <H4>Screening Progress: {Math.ceil((props.progress / 1) * 100)}%</H4>
            <ProgressBar animate={false} stripes={false} intent={'success'} value={props.progress}></ProgressBar>
        </div>
    )
}

interface ISubmissionInfo {
    ligandFileName: string,
    receptorListFilename: string,
    submissionTime: string
}

function SubmissionInfo(props: {setLoading: Function, toaster: IToaster}) {
    const history = useHistory();
    const location = useLocation();
    const [id, setId] = React.useState<string>("")
    const [found, setFound] = React.useState<boolean>(false);
    const [info, setInfo] = React.useState<ISubmissionInfo|null>();
    const [progress, setProgress] = React.useState<number>(0);
    const [status, setStatus] = React.useState<number>(0);
    const [resultsResponseData, setResultsResponseData] = React.useState<any>();
    const foundRef = useRef<boolean>(false);
    const progressRef = useRef<number>(0);
    const statusRef = useRef<number>(0);
    
    statusRef.current = status;
    progressRef.current = progress;
    foundRef.current = found;

    async function updateStatus(id: string): Promise<number> {
        if (statusRef.current < 6) {
            var status = await axios.get(`/submissions/${id}/status`);
            setStatus(status.data);
            return status.data;
        }
        return statusRef.current;
    }

    async function updateProgress(id: string): Promise<number> {
        if (progressRef.current !== 1) {
            var progresss = await axios.get(`/submissions/${id}/progress`);
            setProgress(progresss.data);
            return progresss.data;
        }  
        return progressRef.current;
    }

    async function updateResults(id: string, status: number, progress: number, initial: boolean) {
        if (status >= 5 && (progress !== 1 || initial)) {
            var results = await axios.get(`/submissions/${id}/results`);
            setResultsResponseData(results.data);
        }
    }

    async function updateProperties(id: string, initial: boolean = false) {
        if (foundRef.current) {
            var status = await updateStatus(id);
            var progress = await updateProgress(id);
            await updateResults(id, status, progress, initial);
        }
    } 

    useEffect(() => {
        var queryid = qs.parse(location.search, {ignoreQueryPrefix: true})
        if (queryid.id != null) {
            setId(queryid.id.toString());
            findJob(queryid.id.toString());
            const interval = setInterval(() => {
                updateProperties(queryid.id!.toString());
            }, 60000)

            return () => clearInterval(interval);
        } else {
            props.toaster.show({message: `Please follow the link sent to you via email to see more about your submission.`, intent: "danger", icon: "cross"})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // empty deps => run once

    function findJob(ids: string = id) {
        history.push("/info?id=" + ids);
        props.setLoading(true);
        axios.get(`/submissions/${ids}`)
        .then(async (response) => {
            setFound(true);
            setInfo(response.data);
            updateProperties(ids.toString(), true);
            props.setLoading(false);
        }).catch(
            (error) => {
                setFound(false);
                props.toaster.show({message: `Could not find submission for id ${ids}`, intent: "danger", icon: "cross"});
                props.setLoading(false);
            }
        )
    }

    return (
        <Container className="SubmissionInfo">
            {found &&
                <Row nogutter>
                    <Col md={8}>
                        <Card elevation={1} style={{height: "225px"}}>
                            <H3>Information</H3>
                            <HTMLTable bordered striped width={"100%"}>
                                <tbody>
                                    <tr>
                                        <td><b>Submitted Ligand</b></td>
                                        <td>{info?.ligandFileName}</td>
                                        <td><AnchorButton icon="download" minimal href={`${axios.defaults.baseURL}/submissions/${id}/ligand`}></AnchorButton></td>
                                    </tr>
                                    <tr>
                                        <td><b>Time of Submission</b></td>
                                        <td>{info?.submissionTime}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </HTMLTable>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card elevation={1} style={{height: "225px"}}>
                            <H3>Status</H3>
                            <SubmissionStatus status={status}></SubmissionStatus>
                            {  status > 4 &&
                                <SubmissionProgress progress={progress}></SubmissionProgress>
                            }
                        </Card>
                    </Col>
                </Row>
            }
            {found && resultsResponseData != null &&
                <SubmissionResult resultsResponseData={resultsResponseData} toaster={props.toaster} id={id} setLoading={props.setLoading}></SubmissionResult>
            }
        </Container>
    )
};

export {
    SubmissionInfo
}