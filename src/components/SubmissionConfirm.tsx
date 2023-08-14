import { IToaster, Spinner } from "@blueprintjs/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { Container } from "react-grid-system";
import { useLocation } from "react-router-dom"

export default function SubmissionConfirm(props: {toaster: IToaster}) {
    const location = useLocation();
    const [error, setError] = useState<string|null>(null);


    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const submissionId = query.get("id");
        const confirmationId = query.get("confirmationId");
        if (submissionId && confirmationId) {
            axios.post(`/submissions/${submissionId}/confirm/${confirmationId}`).then(() => {
                    window.location.href = `/info?id=${submissionId}`
                }
            ).catch((err) => {
                setError(err.toString());
                props.toaster.show({message: `Error occured during confirmation: ${err}`, intent: "danger"});
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container style={{ paddingTop: "40px" }}>
            { error ? <div><h1>Error</h1><p>{error}</p></div> : <Spinner></Spinner> }
        </Container>
    )
}