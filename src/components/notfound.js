import React from "react";
import {Result, Button} from "antd";

const NotFound = function (props) {
    const back = () => {
        props.history.push("/");
    }

    return (
        <div>
            <Result status={404} title={404} subTitle={"抱歉，您请求的页面无法显示"}
                    extra={<Button type="link" onClick={back}>回到主页面</Button>}/>
        </div>
    )
}

export default NotFound;