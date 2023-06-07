import { Icon} from "@blueprintjs/core";

enum EState {
    Pending,
    Success,
    Failure
}

export default function SubmissionResult(props : {status: number}) {
    function getIcon(state: EState) {
        switch (state) {
            case EState.Pending: 
                return <Icon icon="info-sign" intent='none'/>
            case EState.Success:
                return <Icon icon="tick" intent='success'/>
            case EState.Failure:
                return <Icon icon="cross" intent='danger'/>
        } 
    }

    return <ul style={{paddingLeft: "5px"}}>
            <li style={{listStyleType: "none"}}>
                {props.status === 1 ? getIcon(EState.Pending) : (props.status >= 2 ? getIcon(EState.Success) : getIcon(EState.Failure)) }
                <span style={{marginRight: "5px"}}></span>
                {props.status === 1 ? <span style={{color: "gray"}}>Confirmation pending</span> : (props.status >= 2 ? "Confirmed" : "Submission incomplete")}
            </li>
            <li style={{listStyleType: "none"}}>
                {props.status <= 2 ? getIcon(EState.Pending) : (props.status >= 4 ? getIcon(EState.Success) : getIcon(EState.Failure)) }
                <span style={{marginRight: "5px"}}></span>
                {props.status <= 2 ? <span style={{color: "gray"}}>Screening preparation pending</span> : (props.status >= 2 ? "Screening preparation complete" : "Screening preparation failed")}
            </li>
            <li style={{listStyleType: "none"}}>
                {props.status <= 4 ? getIcon(EState.Pending) : (props.status >= 5 ? getIcon(EState.Success) : null) }
                <span style={{marginRight: "5px"}}></span>
                {props.status <= 4 ? <span style={{color: "gray"}}>Screening pending</span> : (props.status >= 5 ? "Screening started" : null)}
            </li>
            { props.status >= 5 &&
                <li style={{listStyleType: "none"}}>
                    {props.status === 6 ? getIcon(EState.Success) : (props.status === 5 ? getIcon(EState.Pending) : getIcon(EState.Failure)) }
                    <span style={{marginRight: "5px"}}></span>
                    {props.status === 6 ? "Screening complete" : (props.status === 5 ? <span style={{color: "gray"}}>Screening in progress</span> : "Error occured during screening")}
                </li>
            }
        </ul>
}
