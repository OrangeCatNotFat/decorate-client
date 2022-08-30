import React from 'react';
import { Input, Button, Form, Row, Col, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { HOST, PORT } from "../config/apiconfig";
import "../css/login.css";
import axios from "axios";
import logo from '../logo.png';
import md5 from 'js-md5'; // 引入md5加密算法
import store from "../store";

class Login extends React.Component {

    loginFormRef = React.createRef(); // 与render函数中的登录表单进行绑定

    login = async () => {
        // 对表单控件进行规则验证，验证设置了rules属性的控件（Form.Item）
        await this.loginFormRef.current.validateFields()
            .then(value => { // 验证成功，value是验证成功的控件的值
                // value是对象，里面是表单的值
                axios.post(`${HOST}:${PORT}/admins/login`, { user: { username: value.username, password: md5(value.password) } })
                    .then(result => {
                        if (result.data.status === 200) { // 登录成功
                            if (result.data.role === 2) {
                                message.error("该账户已注销，如需启用请联系管理员");
                            } else {
                                // 将用户名和真实姓名写入到sessionStorage中
                                // sessionStorage.setItem("username", value.username);
                                // 将token写入到sessionStorage中
                                sessionStorage.setItem("token", result.data.token);
                                // 将身份写到页面上
                                // sessionStorage.setItem("role", result.data.role);
                                const action = {
                                    type: "user_login",
                                    userData: result.data.data
                                }
                                store.dispatch(action); // 订阅
                                // 进行页面跳转
                                setTimeout(() => {
                                    this.props.history.push("/home");
                                }, 0);
                            }
                        } else {
                            message.error(result.data.msg);
                        }
                    }).catch(err => {
                        console.log(err);
                    })
            })
    }

    render() {
        return (
            <div className={"loginPage"}>
                <section className="login-content">
                    <div>
                        <img src={logo} style={{ width: "400px" }} alt="logo" />
                    </div>
                    <div style={{ marginLeft: "20px" }}>
                        <h2 className={"login-title"}>创客装修后台管理系统</h2>
                        <Form ref={this.loginFormRef}>
                            <Row style={{ height: "70px" }}>
                                <Col span={24}>
                                    <Form.Item
                                        name={"username"}
                                        rules={[  // 规则
                                            {
                                                required: true,
                                                message: '电话号码不能为空'
                                            },
                                            {
                                                pattern: /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/,
                                                message: "请输入正确的电话号码"
                                            }
                                        ]}
                                    >
                                        <Input
                                            style={{ borderRadius: "24px" }}
                                            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                                            placeholder={"请输入电话号码"}
                                            size={"large"} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row style={{ height: "70px" }}>
                                <Col span={24}>
                                    <Form.Item name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message: '登录密码不能为空'
                                            }
                                        ]}>
                                        <Input.Password
                                            style={{ borderRadius: "24px" }}
                                            prefix={<LockOutlined style={{ color: "rgba(0,0,0,0.25)" }} />}
                                            placeholder={"请输入登录密码"}
                                            size={"large"} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Button type={"primary"} style={{ width: "100%", borderRadius: "24px" }}
                                        size={"large"} onClick={this.login}>登录</Button>
                                </Col>
                            </Row>
                        </Form>
                        <div style={{ float: "right", marginTop: "5px" }}>
                            <Button type={"link"} onClick={() => this.props.history.push("/findPwd")}>忘记密码？</Button>
                        </div>
                    </div>
                </section>
            </div >
        )
    }
}

export default Login;







