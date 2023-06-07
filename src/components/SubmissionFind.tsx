import { FormGroup, InputGroup, Button } from '@blueprintjs/core';

interface IProps {
    id: string
    onInputChange: Function
    onButtonClick: Function
}

export default function SubmissionFind(props: IProps) {
    return (
        <div className="SubmissionFind">
            <FormGroup label={"Insert unique ID:"}
                       inline={true}>
                <InputGroup value={props.id} onChange={(event) => {props.onInputChange(event)}}
                            onKeyPress={(e) => e.key === 'Enter' ? props.onButtonClick(): null}></InputGroup>
                <Button intent="primary" text="Find" onClick={() => {props.onButtonClick()}}></Button>
            </FormGroup>
        </div>
    )
}