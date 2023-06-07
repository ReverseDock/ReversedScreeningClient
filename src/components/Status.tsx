import React, { useEffect } from 'react';
import axios from 'axios';

export default function Status() {
    const [status, setStatus] = React.useState<number>(0);

    async function updateStatus(): Promise<number> {
        var status = await axios.get(`/submissions/status`);
        setStatus(status.data);
        return status.data;
    }

    async function updateProperties() {
        await updateStatus();
    } 

    useEffect(() => {
        updateProperties();
        const interval = setInterval(() => {
            updateProperties();
        }, 60000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // empty deps => run once

    function returnStatus(status: number) {
        if (status === 0) return ": 0";
        if (status < 10) return "< 10";
        if (status < 100) return "< 100";
        if (status < 1000) return "< 1000";
        if (status < 10000) return "< 10000";
        return "≥ 10000";
    }

    return(
        <div>Queued dockings {returnStatus(status)}</div>
    )
}