import React from 'react';
import axios from 'axios';
import { FileInput, AnchorButton, FormGroup, IToaster, Card, Callout, ProgressBar, Spinner, InputGroup, Divider, Icon } from '@blueprintjs/core';
import { Link, useHistory } from "react-router-dom";
import { Row, Col } from 'react-grid-system';

interface ReceptorFeedback {
    status: string,
    uniProtId: string,
    name: string
}

function UploadLigands(props : {setLoading: Function, toaster: IToaster, setStep: Function, setId: Function,
                                  selectedFiles?: FileList, setSelectedFiles: Function}) {
    const [fileFormName, setFileFormName] = React.useState<string>("Select file")
    const [formData, setFormData] = React.useState<FormData>(new FormData());
    // const noReceptors = props.selectedFiles != null ? props.selectedFiles.length : 0;

    function onFileChange(event : React.ChangeEvent<HTMLInputElement>) {
        setFormData(new FormData());
        if (event.target.files != null) {
            props.setSelectedFiles(event.target.files);
            let names = ""
            for (var i = 0; i < event.target.files.length; i++) {
                names += event.target.files[i].name + ", "
            }
            setFileFormName(names.substr(0, names.length - 2));
        }
    }

    function sendToApi() {
        props.setLoading(true);
        axios.post("/submissions", formData).then(
            (response) => {
                if (response.status === 200) {
                    if (response.data) {
                        props.toaster.show({message: "File uploaded successfully", intent: "success", icon:"tree"});
                        props.setId(response.data)
                        props.setStep(1);
                        props.setLoading(false);
                    } else {
                        props.toaster.show({message: "Error when trying to upload file.", intent: "danger"})
                    }
                }
            }
        ).catch(
            (error) => {
                setFormData(new FormData());
                if (error.response) {
                    if (error.response.status === 409) {
                        console.log(error.response)
                        props.toaster.show({message: "Upload failed. Check file extension", intent: "danger", icon: "cross"});
                    } else {
                        props.toaster.show({message: "" + error + ". Please contact the administrator: findr@biologie.uni-freiburg.de.", intent: "danger", icon: "cross"})
                    }
                } else {
                    props.toaster.show({message: "" + error + ". Please contact the administrator: findr@biologie.uni-freiburg.de.", intent: "danger", icon: "cross"});
                }
                props.setLoading(false);
            }
        )
    }

    function onNextClick() {
        if (props.selectedFiles != null) {
            for (var i = 0; i < props.selectedFiles.length; i++) {
                formData.append("ligandFile", props.selectedFiles[i], props.selectedFiles[i].name)
                let ext = props.selectedFiles[i].name.split(".").pop();
                if (ext !== "mol2") {
                    props.toaster.show({message: "Wrong file extension. Please provide a .mol2 file.", intent: "danger", icon: "cross"})
                    return;
                }
            }
            sendToApi();
        }
    }

    return (
        <div>
            <Callout intent="primary" icon="info-sign" title="Uploading the ligand">
                <p>Please choose your ligand in .mol2 format.</p>
                <p>If your ligand is a different file format than .mol2 you can use <a rel="noopener noreferrer" target="_blank" href="https://www.cheminfo.org/Chemistry/Cheminformatics/FormatConverter/index.html">Open Babel</a> to convert it to .mol2.</p>
                <p>You can download an example ligand (Vitamin D) <Link to="/vitaminD.mol2" target="_blank" download>here</Link>.</p>
            </Callout>
            <FormGroup label="Select ligand file in .mol2 format.">
                <FileInput text={fileFormName} hasSelection={!(props.selectedFiles == null)}
                        onInputChange={onFileChange} inputProps={{multiple: false}}
                        id="file-upload" fill/>
            </FormGroup>
            
            <div className="align-right">
                <AnchorButton onClick={onNextClick} intent="primary" disabled={!(props.selectedFiles != null)}>Next</AnchorButton>
            </div>
        </div>
    )
}

function UploadReceptors(props : {setLoading: Function, toaster: IToaster, setStep: Function, id: string,
                         selectedFiles?: FileList, setSelectedFiles: Function}) {
    const [fileFormName, setFileFormName] = React.useState<string>("Select file")
    const [formData, setFormData] = React.useState<FormData>(new FormData());
    const [listUploaded, setListUploaded] = React.useState<boolean>(false);
    const [atLeastOneReceptorOkay, setAtLeastOneReceptorOkay] = React.useState<boolean>(false);
    const [receptorFeedback, setReceptorFeedback] = React.useState<ReceptorFeedback[]>([]);
    const [exhaustiveness, setExhaustiveness] = React.useState<number>(-1);
    const [feedbackLoading, setFeedbackLoading] = React.useState<boolean>(false);

    function onFileChange(event : React.ChangeEvent<HTMLInputElement>) {
        setFormData(new FormData());
        if (event.target.files != null) {
            props.setSelectedFiles(event.target.files);
            let names = ""
            for (var i = 0; i < event.target.files.length; i++) {
                names += event.target.files[i].name + ", "
            }
            setFileFormName(names.substr(0, names.length - 2));
        }
    }

    function sendToApi() {
        setFeedbackLoading(true);
        setReceptorFeedback([]);
        axios.post("/submissions/" + props.id + "/receptors", formData).then(
            (response) => {
                if (response.status === 200) {
                    if (response.data) {
                        props.toaster.show({message: "File uploaded successfully", intent: "success", icon:"tree"});
                        console.log(response.data);
                        setReceptorFeedback(response.data.receptors);
                        setExhaustiveness(response.data.exhaustiveness);
                        setAtLeastOneReceptorOkay(response.data.receptors.some((val: ReceptorFeedback) => val.status === "Okay"))
                        setListUploaded(true);
                        setFeedbackLoading(false);
                    } else {
                        props.toaster.show({message: "Error when trying to upload file.", intent: "danger"})
                    }
                }
            }
        ).catch(
            (error) => {
                setFeedbackLoading(false);
                setFormData(new FormData());
                if (error.response) {
                    if (error.response.status === 400) {
                        console.log(error.response)
                        props.toaster.show({message: "Upload failed. Check file format.", intent: "danger", icon: "cross"});
                    } else {
                        props.toaster.show({message: "" + error + ". Please contact the administrator: findr@biologie.uni-freiburg.de.", intent: "danger", icon: "cross"})
                    }
                } else {
                    props.toaster.show({message: "" + error + ". Please contact the administrator: findr@biologie.uni-freiburg.de.", intent: "danger", icon: "cross"});
                }
            }
        )
    }

    function onUploadClick() {
        setListUploaded(false);
        if (props.selectedFiles != null) {
            for (var i = 0; i < props.selectedFiles.length; i++) {
                formData.append("receptorsFile", props.selectedFiles[i], props.selectedFiles[i].name)
            }
            sendToApi();
        }
    }

    function onNextClick() {
        props.setStep(2)
    }

    function mapReceptorStatusToString(receptorStatus : string) : string {
        if (receptorStatus === "NotFound") return ": File not found. Either not part of available proteomes or prediction was not available at time of publication."
        if (receptorStatus === "TooBig") return ": Too many amino acids. Limit is 1000."
        if (receptorStatus === "Error") return ": There was an error with preparing the file for docking."
        if (receptorStatus === "Okay") return ""
        return "";
    }

    return (
        <div>
            <Callout intent="primary" icon="info-sign" title="Choosing your targets">
                <p>Please upload your target proteins as a text file as shown below. Submissions are limited to less than 1000 sequences for proteins that are less than 1000 amino acids. The number of provided receptors influences the time spent trying to minimize affinity per docking, i.e. the exhaustiveness parameter of AutoDock Vina.</p>
                <p>At the moment, proteins from the following organisms are supported:</p>
                <ul>
                    <li>Human (<i>Homo sapiens</i>)</li>
                    <li>E.coli (<i>Escherichia coli</i> strain K12)</li>
                    <li>Mouse (<i>Mus musculus</i>)</li>
                </ul>
                <p>Recognized formats:</p>
                <Row>
                    <Col md={6}>
                        <p style={{marginBottom: "2px"}}><b>List of UniProtIds</b></p>
                        <Card style={{maxHeight: "100px", overflow: "scroll", padding: "10px"}}>
                            <p style={{marginBottom: "2px"}}>P47887</p>
                            <p style={{marginBottom: "2px"}}>P35520</p>
                            <p style={{marginBottom: "2px"}}>P01742</p>
                            <p style={{marginBottom: "2px"}}>Q8N0Z6</p>
                            <p style={{marginBottom: "2px"}}>Q9UHD0</p>
                            <p style={{marginBottom: "2px"}}>Q9NRF9</p>
                            <p style={{marginBottom: "2px"}}>P36897</p>
                        </Card>
                        <p style={{marginTop: "10px"}}><Link to="/example_list.txt" target="_blank" download>Download example</Link></p>
                    </Col>
                    <Col md={6} style={{marginBottom: "10px"}}>
                        <p style={{marginBottom: "2px"}}><b><a rel="noopener noreferrer" target="_blank" href="http://amigo.geneontology.org/amigo/search/bioentity">AmiGO 2</a> Output </b></p>
                        <Card style={{maxHeight: "100px", overflow: "scroll", padding: "10px"}}>
                            <p style={{marginBottom: "2px"}}>UniProtKB:A0A6I8RXG4&nbsp;&nbsp;&nbsp;A0A6I8RXG4</p>	
                            <p style={{marginBottom: "2px"}}>UniProtKB:L7MUI2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;t2r24</p>	
                            <p style={{marginBottom: "2px"}}>UniProtKB:H0ZSM0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;LOC105759119</p>	
                            <p style={{marginBottom: "2px"}}>UniProtKB:A0A803J8A5&nbsp;&nbsp;&nbsp;A0A803J8A5</p>	
                        </Card>
                        <p style={{marginTop: "10px"}}><Link to="/example_amigo_list.txt" target="_blank" download>Download example</Link></p>
                    </Col>
                </Row>
            </Callout>
            <FormGroup label="Select text file.">
                <Row nogutter>
                    <Col md={11}>
                        <FileInput text={fileFormName} hasSelection={!(props.selectedFiles == null)}
                            onInputChange={onFileChange} inputProps={{multiple: false}}
                            id="file-upload" fill/>
                    </Col>
                    <Col md={1} style={{paddingLeft: "5px"}}>
                        <AnchorButton onClick={onUploadClick} intent="primary" disabled={!(props.selectedFiles != null)}>Upload</AnchorButton>
                    </Col>
                </Row>
            </FormGroup>
            {
                feedbackLoading &&
                <Spinner></Spinner>
            }
            {receptorFeedback.length !== 0
            ?
                <div>
                    <Divider style={{marginBottom: "15px"}}></Divider>
                    <Callout title="Feedback" intent='primary'>
                        <p>Out of <b>{receptorFeedback.length}</b> provided receptors, <b>{receptorFeedback.filter(x => x.status === "Okay").length}</b> can be docked,
                        with an exhaustiveness of <b>{exhaustiveness}</b></p>
                        <p>If you would like to increase the exhaustiveness of docking simulations (maximum is set to 24) it is recommended to submit fewer proteins.
                        </p>
                        <p>Below you will find a detailed summary of your provided input. Green receptors will be docked, red ones skipped. This is either because
                        they are not available or are too large. The list is <b>scrollable</b>.</p>
                    </Callout>
                    <div style={{maxHeight: "400px", overflow: "scroll"}}>
                        <ul>
                            {receptorFeedback.map((value, idx) => (
                                
                                <li key={idx} style={{listStyleType: "none"}}>
                                    {value.status === "Okay" ? <Icon icon="tick" intent='success'/> : <Icon icon="cross" intent='danger'/>}
                                    <span style={{marginRight: "5px"}}></span>
                                    <span style={{color: value.status === "Okay" ? "green" : "red"}}>
                                    {value.uniProtId} - {value.name}<b>{mapReceptorStatusToString(value.status)}</b>
                                    </span>
                                </li>
                            ))
                            }
                        </ul>
                    </div>
                </div>
            : null
            }
            <div className="align-right">
                <AnchorButton onClick={onNextClick} intent="primary" disabled={!(listUploaded) || !(atLeastOneReceptorOkay)}>Next</AnchorButton>
            </div>
        </div>
    )
}

function ParamsSubmit(props: {toaster: IToaster, selectedFiles?: FileList, uuid: string}) {
    const history = useHistory();
    const [email, setEmail] = React.useState<string>("");
    
    function submitForm() {
        const formData = new FormData();

        formData.append("emailAddress", email);

        axios.post("/submissions/" + props.uuid + "/confirm", formData).then(
            (response) => {
                props.toaster.show({message: "Submission successful!", intent: "success", icon:"tree"});
                console.log(response.data);
                history.push(`/confirm?id=${props.uuid}&confirmationId=${response.data}`)
        }).catch(
            (err) => {
                props.toaster.show({message: `Submission unsuccessful: ${err}` , intent: "danger"})
        })
        
    }

    function onSubmitClick() {
        submitForm();
    }


    return(
        <div className="SubmissionSubmitForm">
            <Row gutterWidth={0}>
            <Callout intent='primary'>
                    <p>Provide an email address if you would like to get updates on your submission.</p>
                    <p>This is <b>optional</b>. After submitting, you will be forwarded to a status and results page that can be <b>bookmarked</b> for later reference.</p>
                </Callout>
                <FormGroup helperText="Optionally provide an e-mail address where we will notify you as soon as your submissions has completed!" label="E-Mail address">
                    <InputGroup value={email} onChange={(event) => setEmail(event.target.value)}>
                    </InputGroup>
                </FormGroup>
            </Row>
            
            <Row id="submitButtonRow">
                <AnchorButton intent="primary" rightIcon="confirm" text="Submit" onClick={onSubmitClick}/>
            </Row>
        </div>
    )
}

export default function SubmissionSubmit(props : {setLoading: Function, toaster: IToaster}) {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [step, setStep] = React.useState<number>(0);
    const [id, setId] = React.useState<string>("");
    const [fileList, setFileList] = React.useState<FileList>();

    function getSubComponent() {
        switch (step) {
            case 0:
                return <UploadLigands setLoading={setLoading} toaster={props.toaster} setStep={setStep} setId={setId}
                        selectedFiles={fileList} setSelectedFiles={setFileList}/>
            case 1:
                return <UploadReceptors setLoading={setLoading} toaster={props.toaster} setStep={setStep} id={id}
                        selectedFiles={fileList} setSelectedFiles={setFileList}/>
            case 2:
                return <ParamsSubmit selectedFiles={fileList} toaster={props.toaster}
                        uuid={id}/>
            default:
                return <div></div>;
        }
    }
    return(
        <div>
            <ProgressBar stripes={false} intent="primary"
                         value={step < 3 ? step/4 : 0.75}/>
            <Row className="SubmissionSubmit">
                <Col xs={12}>
                    <p>
                        
                    </p>
                </Col>
                <Col className="SubComponent" xs={12}>
                    <Card elevation={1}>
                        {!loading
                        ?
                            getSubComponent()
                        :
                            <div className="LoadingPDB">
                                <Spinner>  
                                </Spinner>
                                <div style={{padding: "0px", marginTop: "12px", textAlign:"center"}}> Uploading file... </div>
                            </div>
                        }

                    </Card>
                </Col>
            </Row>
        </div>
    )
}
