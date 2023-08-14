import React from 'react';
import axios from 'axios';
import { FileInput, AnchorButton, FormGroup, IToaster, Card, Callout, ProgressBar, Spinner, InputGroup } from '@blueprintjs/core';
import { Link, useHistory } from "react-router-dom";
import { Row, Col } from 'react-grid-system';

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
    const [fileFormName, setFileFormName] = React.useState<string>("Select file(s)")
    const [formData, setFormData] = React.useState<FormData>(new FormData());

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
        axios.post("/submissions/" + props.id + "/receptors", formData).then(
            (response) => {
                if (response.status === 200) {
                    props.toaster.show({message: "File(s) uploaded successfully", intent: "success", icon:"tree"});
                    props.setStep(2)
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
        if (props.selectedFiles != null) {
            for (var i = 0; i < props.selectedFiles.length; i++) {
                formData.append("receptorsFiles", props.selectedFiles[i], props.selectedFiles[i].name)
            }
            sendToApi();
        }
    }

    return (
        <div>
            <Callout intent="primary" icon="info-sign" title="Choosing your targets">
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
                    <Col md={11}>
                        <FileInput text={fileFormName} hasSelection={!(props.selectedFiles == null)}
                            onInputChange={onFileChange} inputProps={{multiple: true}}
                            id="file-upload" fill/>
                    </Col>
                    <Col md={1} style={{paddingLeft: "5px"}}>
                        <AnchorButton onClick={onUploadClick} intent="primary" disabled={!(props.selectedFiles != null)}>Upload</AnchorButton>
                    </Col>
                </Row>
            </FormGroup>
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
                                <div style={{padding: "0px", marginTop: "12px", textAlign:"center"}}> Uploading file(s)... </div>
                            </div>
                        }

                    </Card>
                </Col>
            </Row>
        </div>
    )
}
