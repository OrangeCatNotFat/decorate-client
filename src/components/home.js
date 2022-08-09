import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { HOST, PORT } from "../config/apiconfig";
import { Button, Form, Input, message, Modal, Tag } from "antd";
import store from "../store";
import md5 from "js-md5";

const Home = (props) => {
    const [person, setPerson] = useState(store.getState().userData); // 存放当前页面的数据
    const [state, setState] = useState(true); // 记录当前页面是否修改
    const [pwdVisible, setPwdVisible] = useState(false); // 是否显示修改密码模态框
    const [nameVisiable, setNameVisiable] = useState(false); // 是否显示修改名字模态框

    const pwdRef = useRef(); // 与密码模态框绑定
    const nameRef = useRef(); // 与用户名模态框绑定

    const getPerson = () => { // 获取当前人的信息
        // let username = sessionStorage.getItem("username"); // 获取用户名
        // console.log(username);
        // axios.get(`${HOST}:${PORT}/admins/one`, { params: { username: username } })
        //     .then(result => {
        //         if (result.data.status === 200) { // 成功查找到人
        //             setPerson(result.data.data);
        //         }
        //         if (result.status === 400) {
        //             message.error(result.data.msg);
        //         }
        //     }).catch(err => {
        //         console.log(err);
        //     })
    }

    // 每次都调用函数获取信息，当person更改时才调用
    useEffect(() => {
        setPerson(store.getState().userData)
    }, [state]);

    // 判断管理员身份
    let identify = ["超级管理员", "普通管理员"];

    // 显示修改密码模态框
    const showPwdModal = () => {
        setPwdVisible(true);
    }
    // 显示修改名字模态框
    const showNameModal = () => {
        setNameVisiable(true);
    }

    const handleCancel = () => { // 关闭模态框
        if (pwdVisible) {
            setPwdVisible(false);
        }
        if (nameVisiable) {
            setNameVisiable(false);
        }
    }

    // 修改密码
    const ModifyPwd = async () => {
        await pwdRef.current.validateFields()
            .then(value => { // 原密码+新密码+确认密码
                let pwd = {
                    password: md5(value.password),
                    newPwd: md5(value.newPwd)
                }
                axios.post(`${HOST}:${PORT}/admins/modifypwd`, { username: person.username, pwd })
                    .then(result => {
                        if (result.data.status === 201) {
                            message.success(result.data.msg);
                            setPwdVisible(false);
                        }
                        if (result.data.status === 404) {
                            message.error(result.data.msg);
                        }
                    }).catch(err => {
                        console.log(err);
                    })
            })
    }

    // 修改用户名
    const ModifyName = async () => {
        await nameRef.current.validateFields()
            .then(value => { // 获取到的姓名，如果为空是空对象
                axios.post(`${HOST}:${PORT}/admins/modifyname`, {
                    username: person.username,
                    name: person.name,
                    newName: value
                }).then(result => {
                    if (result.data.status === 400) { // 啥都没修改
                        message.info(result.data.msg);
                    } else if (result.data.status === 201) { // 修改了
                        message.success(result.data.msg);
                        const action = {
                            type: "user_login",
                            userData: result.data.data
                        }
                        store.dispatch(action);
                        // sessionStorage.setItem("username", result.data.data.username);
                        setNameVisiable(false); // 关闭模态框
                        setState(!state); // 更新数据
                    } else if (result.data.status === 422) {
                        message.error(result.data.msg);
                    }
                })
            })
    }

    return (
        <>
            <div style={{ margin: "30px 20px" }}>
                <p style={{ fontSize: "30px" }}>{person.name}</p>
                <p style={{ marginTop: "-30px" }}>
                    <Tag color={"red"}>{identify[person.role]}</Tag>
                </p>
                <hr color={"#f2f4f7"} />
                <h3 style={{ fontFamily: "微软雅黑", fontSize: "20px", fontWeight: "bold" }}>基本信息</h3>
                <div style={{ marginTop: "15px" }}>真实姓名：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{person.name}</div>
                <div style={{ marginTop: "7px" }}>基本信息：&nbsp;<Button type={"link"} onClick={showNameModal}>点击修改</Button>
                </div>
                <div style={{ marginTop: "3px" }}>密&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;码：&nbsp;<Button
                    type={"link"} onClick={showPwdModal}>修改密码</Button></div>
                <div style={{ marginTop: "10px" }}>上次登录：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{person.last_login_at}<br /></div>
                <div style={{ marginTop: "15px" }}>创建时间：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{person.created_at}<br /></div>
                <div style={{ marginTop: "15px" }}>更新时间：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{person.updated_at}</div>
            </div>
            {/*修改密码模态框*/}
            <Modal title={"修改密码"} visible={pwdVisible} onCancel={handleCancel} onOk={ModifyPwd} okText={"确定"}
                cancelText={"取消"} destroyOnClose>
                <Form ref={pwdRef}>
                    <Form.Item label="原&nbsp;&nbsp;密&nbsp;&nbsp;码：" rules={[{
                        required: true,
                        message: "请输入原密码"
                    }]} name={"password"}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="新&nbsp;&nbsp;密&nbsp;&nbsp;码：" rules={[
                        {
                            required: true,
                            message: "请输入新密码"
                        }, {
                            pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                            message: "密码必须是包含字母和数字的8-16位密码"
                        }]
                    } name={"newPwd"}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label={"确认密码："} rules={[{
                        required: true,
                        message: "请确认密码"
                    }, {
                        validator: ((rule, value) => { // value表示当前控件的值
                            let pwd = pwdRef.current.getFieldValue("newPwd"); // 获取输入的密码
                            if (pwd && pwd !== value) {
                                return Promise.reject("两次密码输入不一致")
                            } else {
                                return Promise.resolve(); // 表示验证通过
                            }
                        })
                    }]} name={"comfirmPwd"}>
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
            {/*修改个人信息模态框*/}
            <Modal title={"修改个人信息"} visible={nameVisiable} onCancel={handleCancel} onOk={ModifyName} okText={"确定"}
                cancelText={"取消"} destroyOnClose>
                <Form ref={nameRef}>
                    <Form.Item name={"username"} label="用&nbsp;&nbsp;户&nbsp;&nbsp;名"
                        rules={
                            [{
                                pattern: /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/,
                                message: "请输入正确的电话号码"
                            }]}>
                        <Input placeholder={person.username} />
                    </Form.Item>
                    <Form.Item name={"name"} label={"真实姓名"}>
                        <Input placeholder={person.name} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default Home;