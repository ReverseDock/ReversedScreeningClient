import React from 'react';
import axios from 'axios';
import { FileInput, AnchorButton, FormGroup, IToaster, Card, Callout, ProgressBar, Spinner, InputGroup, TextArea, Divider, Icon } from '@blueprintjs/core';
import { Link, useHistory } from "react-router-dom";
import { Row, Col } from 'react-grid-system';

interface ReceptorFeedback {
    status: string,
    uniProtId: string
}

function UploadLigands(props : {setLoading: Function, toaster: IToaster, setStep: Function, setId: Function}) {
    const [fileFormName, setFileFormName] = React.useState<string>("Select file")
    const [formData, setFormData] = React.useState<FormData>(new FormData());
    const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null);
    // const noReceptors = props.selectedFiles != null ? props.selectedFiles.length : 0;

    function onFileChange(event : React.ChangeEvent<HTMLInputElement>) {
        setFormData(new FormData());
        if (event.target.files != null) {
            setSelectedFiles(event.target.files);
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
        if (selectedFiles != null) {
            for (var i = 0; i < selectedFiles.length; i++) {
                formData.append("ligandFile", selectedFiles[i], selectedFiles[i].name)
                let ext = selectedFiles[i].name.split(".").pop();
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
            <Callout intent="primary" icon="info-sign" title="Upload the ligand">
                <p>Please choose your ligand in .mol2 format. If your ligand is a different file format than .mol2 you can use <a rel="noopener noreferrer" target="_blank" href="https://www.cheminfo.org/Chemistry/Cheminformatics/FormatConverter/index.html">Open Babel</a> to convert it to .mol2.</p>
                <p>Your ligand will be protonated at pH 7 using <a rel="noopener noreferrer" target="_blank" href="https://www.cheminfo.org/Chemistry/Cheminformatics/FormatConverter/index.html">Open Babel</a>.</p>
                <p>You can download an example ligand (Vitamin D) <Link to="/vitaminD.mol2" target="_blank" download>here</Link>.</p>
            </Callout>
            <FormGroup label="Select ligand file in .mol2 format.">
                <FileInput text={fileFormName} hasSelection={!(selectedFiles == null)}
                        onInputChange={onFileChange} inputProps={{multiple: false}}
                        id="file-upload" fill/>
            </FormGroup>
            
            <div className="align-right">
                <AnchorButton onClick={onNextClick} intent="primary" disabled={!(selectedFiles != null)}>Next</AnchorButton>
            </div>
        </div>
    )
}

function SelectReceptorType(props : {setStep: Function}) {
    return (
    <div>
        <Callout intent='primary' icon="info-sign" title="Select receptor type">
            <p>Choose between PDB files and AlphaFold predictions.</p>
            <Row>
                <Col md={6}>
                    <b>PDB files</b>
                    <p>Upload up to a 100 <b>PDB files</b> with a maximum length of 1000 AAs.</p>

                </Col>
                <Col md={6}>
                    <b>AlphaFold</b>
                    <p>Provide up to a 100 <b>UniProt</b> Ids of protein structures predicted by AlphaFold. Length is limited to 1000 AAs.</p>

                </Col>
            </Row>
        </Callout>
        <div style={{justifyContent: "flex-end", display: "flex"}}>
            <AnchorButton onClick={() => props.setStep(2)} intent='primary'>PDB Files</AnchorButton>
            <AnchorButton onClick={() => props.setStep(3)} intent='primary' style={{marginLeft: "10px"}}>AlphaFold</AnchorButton>
        </div>
    </div>
    )
}

function UploadReceptors(props : {setLoading: Function, toaster: IToaster, setStep: Function, id: string}) {
    const [fileFormName, setFileFormName] = React.useState<string>("Select file(s)")
    const [formData, setFormData] = React.useState<FormData>(new FormData());
    const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null);

    function onFileChange(event : React.ChangeEvent<HTMLInputElement>) {
        setFormData(new FormData());
        if (event.target.files != null) {
            setSelectedFiles(event.target.files);
            let names = ""
            for (var i = 0; i < event.target.files.length; i++) {
                names += event.target.files[i].name + ", "
            }
            setFileFormName(names.substr(0, names.length - 2));
        }
    }

    function sendToApi() {
        props.setLoading(true);
        axios.post("/submissions/" + props.id + "/receptors", formData).then(
            (response) => {
                if (response.status === 200) {
                    props.toaster.show({message: "File(s) uploaded successfully", intent: "success", icon:"tree"});
                    props.setStep(4)
                    props.setLoading(false);
                }

            }
        ).catch(
            (error) => {
                setFormData(new FormData());
                props.setLoading(false);
                if (error.response) {
                    if (error.response.status === 400) {
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
        if (selectedFiles != null) {
            for (var i = 0; i < selectedFiles.length; i++) {
                formData.append("receptorsFiles", selectedFiles[i], selectedFiles[i].name)
            }
            sendToApi();
        }
    }

    return (
        <div>
            <Callout intent="primary" icon="info-sign" title="Choose your targets">
                <p>Please upload your target proteins in PDB format below. Submissions are limited to less than 100 proteins that are less than 1000 amino acids.</p>
                <p style={{marginBottom: "0px"}}>Note that in the next steps:</p>
                <ul style={{marginTop: "0px"}}>
                    <li>DNA/RNA are removed</li>
                    <li>PDBFixer is applied to
                        <ul>
                            <li>Add missing residues</li>
                            <li>Replace non-standard residues</li>
                            <li>Remove heterogen atoms, including water</li>
                            <li>Add missing heavy atoms</li>
                        </ul>
                    </li>
                    <li>pdb2pqr is applied to protonate proteins at pH 7</li>
                </ul>
            </Callout>
            <FormGroup label="Select PDB files.">
                <Row nogutter>
                    <Col md={12}>
                        <FileInput text={fileFormName} hasSelection={!(selectedFiles == null)}
                            onInputChange={onFileChange} inputProps={{multiple: true}}
                            id="file-upload" fill/>
                    </Col>
                </Row>
            </FormGroup>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <AnchorButton onClick={() => props.setStep(1)} intent='primary'>Back</AnchorButton>
                <AnchorButton onClick={onUploadClick} intent="primary" disabled={!(selectedFiles != null)}>Upload</AnchorButton>
            </div>
        </div>
    )
}

function UploadUniProtIds(props : {setLoading: Function, toaster: IToaster, setStep: Function, id: string}) {
    const [listUploaded, setListUploaded] = React.useState<boolean>(false);
    const [atLeastOneReceptorOkay, setAtLeastOneReceptorOkay] = React.useState<boolean>(false);
    const [receptorFeedback, setReceptorFeedback] = React.useState<ReceptorFeedback[]>([]);
    const [feedbackLoading, setFeedbackLoading] = React.useState<boolean>(false);
    const [textField, setTextField] = React.useState<string>("");

    function sendToApi(uniProtIds: string[]) {
        setFeedbackLoading(true);
        setReceptorFeedback([]);
        axios.post("/submissions/" + props.id + "/receptors/uniprot",
            uniProtIds
        ).then(
            (response) => {
                if (response.status === 200) {
                    if (response.data) {
                        props.toaster.show({message: "UniProt ids selected successfully", intent: "success", icon:"tree"});
                        console.log(response.data);
                        setReceptorFeedback(response.data);
                        setAtLeastOneReceptorOkay(response.data.some((val: ReceptorFeedback) => val.status === "Okay"))
                        setListUploaded(true);
                        setFeedbackLoading(false);
                    } else {
                        props.toaster.show({message: "Error when trying to upload UniProt ids.", intent: "danger"})
                    }
                }
            }
        ).catch(
            (error) => {
                setFeedbackLoading(false);
                if (error.response) {
                    if (error.response.status === 400) {
                        console.log(error.response)
                        props.toaster.show({message: "Upload failed.", intent: "danger", icon: "cross"});
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
        if (textField !== "") {
            // Validate text field
            if (textField.match(/[^a-zA-Z0-9_\f\n\r\t\v\u0020\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/) != null) {
                props.toaster.show({message: "Wrong format for UniProt input.", intent: "warning", icon:"warning-sign"})
                return;
            }
            console.log(textField)
            // TODO: Fix newline
            // Extract uniProtIds
            let uniProtIds = textField.split(/\s/).filter(x => x.length > 0);
            sendToApi(uniProtIds);
        }
    }

    function onNextClick() {
        props.setStep(4)
    }

    function mapReceptorStatusToString(receptorStatus : string) : string {
        if (receptorStatus === "Not found") return ": File not found. Either not part of available proteomes or prediction was not available at time of publication."
        if (receptorStatus === "Too long") return ": Too many amino acids. Limit is 1000."
        if (receptorStatus === "Okay") return ""
        return "";
    }

    return (
        <div>
            <Callout intent="primary" icon="info-sign" title="Choose your targets">
                <p>Please enter your UniProt ids in the text field as shown below, <b>one id per line</b>. Submissions are limited to less than 100 sequences for proteins that are less than 1000 amino acids.</p>
                <p style={{marginBottom: "0px"}}>At the moment, proteins from the following organisms are supported:</p>
                <ul style={{marginTop: "0px"}}>
                    <li>Human (<i>Homo sapiens</i>)</li>
                    <li>E.coli (<i>Escherichia coli</i> strain K12)</li>
                    <li>Mouse (<i>Mus musculus</i>)</li>
                    <li>Fruit fly (<i>Drosophila melanogaster</i>)</li>
                    <li>Nematode worm (<i>Caenorhabditis elegans</i>)</li>
                    <li>Thale cress (<i>Arabidopsis thaliana</i>)</li>
                    <li>Baker's yeast (<i>Saccharomyces cerevisiae</i>)</li>
                    <li>Norway rat (<i>Rattus norvegicus</i>)</li>
                </ul>
            </Callout>
            <FormGroup label="Enter UniProt ids, one per line.">
                <Row nogutter>
                    <Col md={11} style={{display: "flex"}}>
                        <TextArea placeholder={"P47887\nQ9UHD0\n..."}
                            value={textField}
                            style={{minHeight: "150px", maxHeight: "200px", minWidth: "200px", maxWidth: "200px"}}
                            onChange={(ev) => setTextField(ev.target.value)}
                            large
                        />
                        <AnchorButton onClick={onUploadClick} intent="primary" disabled={textField === ""}
                            style={{marginLeft: "20px", alignSelf: "flex-end"}}>Check</AnchorButton>
                    </Col>
                    <Col md={1} style={{paddingLeft: "5px"}}>
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
                        <p>Out of <b>{receptorFeedback.length}</b> provided receptors, <b>{receptorFeedback.filter(x => x.status === "Okay").length}</b> can be docked.</p>
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
                                    {value.uniProtId}<b>{mapReceptorStatusToString(value.status)}</b>
                                    </span>
                                </li>
                            ))
                            }
                        </ul>
                    </div>
                </div>
            : null
            }
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <AnchorButton onClick={() => props.setStep(1)} intent='primary'>Back</AnchorButton>
                <AnchorButton onClick={onNextClick} intent="primary" disabled={!(listUploaded) || !(atLeastOneReceptorOkay)}>Next</AnchorButton>
            </div>
        </div>
    )
}

function ParamsSubmit(props: {toaster: IToaster, uuid: string}) {
    const history = useHistory();
    const [email, setEmail] = React.useState<string>("");
    
    function submitForm() {
        const formData = new FormData();

        formData.append("emailAddress", email);

        axios.post("/submissions/" + props.uuid + "/confirm", formData).then(
            (response) => {
                props.toaster.show({message: "Submission successful!", intent: "success", icon:"tree"});
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
                    <p>Note that in the docking simulations:</p>
                    <p>A docking box is automatically generated by extending the coordinates of the protein edges by 30&nbsp;Å. Subsequently, the ligand is docked to the proteins using AutoDock Vina with an exhaustiveness score of 64 and flexible ligand torsion options.</p>
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

    function getSubComponent() {
        switch (step) {
            case 0:
                return <UploadLigands setLoading={setLoading} toaster={props.toaster} setStep={setStep} setId={setId} />
            case 1:
                return <SelectReceptorType setStep={setStep}/>
            case 2:
                return <UploadReceptors setLoading={setLoading} toaster={props.toaster} setStep={setStep} id={id} />
            case 3:
                return <UploadUniProtIds setLoading={setLoading} toaster={props.toaster} setStep={setStep} id={id} />
            case 4:
                return <ParamsSubmit toaster={props.toaster}
                        uuid={id} />
            default:
                return <div></div>;
        }
    }
    return(
        <div>
            <ProgressBar stripes={false} intent="primary"
                         value={step === 0 ? 0 :
                                step === 1 ? 0.25 : 
                                step === 2 ? 0.5 : 
                                step === 3 ? 0.5 : 
                                step === 4 ? 0.75 :
                                            1.00}/>
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
                                <div style={{padding: "0px", marginTop: "12px", textAlign:"center"}}> Uploading file(s)... </div>
                            </div>
                        }

                    </Card>
                </Col>
            </Row>
        </div>
    )
}
