import React, { useState, useEffect, useRef } from "react";
import { Button, Input, PageHeader, Modal, Form, Upload, Row, Col, message, Image, Descriptions, List } from "antd";
import "braft-editor/dist/index.css"; // 引入css样式
import Title from "antd/es/typography/Title";
import { HOST, PORT } from "../../config/apiconfig";
import axios from "axios";
import TextArea from "antd/es/input/TextArea";
import { DeleteOutlined, EditOutlined, EyeOutlined, ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import TextEditor from "../editor";

const Case = function (props) {
    const [allCase, setAllCase] = useState([]); // 用来存放所有的案例
    const [state, setState] = useState(false); // 记录当前页面数据是否修改
    const [isAdd, setIsAdd] = useState(false); // 记录是否是添加页面
    const [isLook, setIsLook] = useState(false); // 记录是否查看页面
    const [isCase, setIsCase] = useState(true); // 记录当前是否是案例主页面
    const [isEdit, setIsEdit] = useState(false); // 记录是否编辑案例
    const [oneCase, setOneCase] = useState(""); // 存放某个案例的内容
    // 下面是添加案例部分的
    const [fileList, setFileList] = useState([]); // 图片文件列表
    const [previewVisiable, setPreviewVisiable] = useState(false); // 记录预览图片的模态框是否打开
    const [previewTitle, setPreviewTitle] = useState(""); // 模态框上显示的图片的标题
    const [previewImage, setPreviewImage] = useState(""); // 预览的图片文件
    const [publishVisiable, setPublishVisiable] = useState(false); // 提交模态框是否显示
    const [content, setContent] = useState(""); // 记录富文本编辑器的内容

    const addCaseRef = useRef(); // 与添加案例表单绑定
    const editCaseRef = useRef(); // 与编辑案例表单绑定

    const handleImgChange = ({ fileList }) => { // 点击上传图片之后，将上传的图片存放在数组
        setFileList(fileList);
    }

    const back = () => { // 退出添加页面的模态框
        Modal.confirm({
            title: "确认退出",
            icon: <ExclamationCircleOutlined />,
            content: "您的文章将不会被保存",
            okText: "确认",
            cancelText: "取消",
            onOk: () => {
                setIsAdd(false); // 关闭添加页面
                setFileList([]); // 将照片列表设空
                setIsCase(true); // 打开案例页面
                setIsEdit(false); // 关闭编辑页面
            },
        })
    }

    const getBase64 = (file) => { // 读取图片文件
        return new Promise((resolve, reject) => {
            const reader = new FileReader(); // 创建读取文件的对象
            reader.readAsDataURL(file); // 读取文件的url
            reader.onload = () => resolve(reader.result); // 返回文件内容
            reader.onerror = (err) => reject(err);
        })
    }

    const uploadButton = ( // 未上传图片时显示的按钮
        <div>
            <PlusOutlined />
            <div style={{ marginTop: "8px" }}>上传封面</div>
        </div>
    )

    const handlePreview = async (file) => { // 图片预览功能，在模态框中预览
        if (!file.url && !file.preview) { // 如果文件没有打开且没有预览，则打开并且预览
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewVisiable(true); // 显示模态框
        setPreviewImage(file.url || file.preview); // 预览图片文件
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1)); // 上传图片的标题
    }

    const beforeUpload = (file) => { // 上传前的格式检查
        const isCorrect = (file.type === "image/jpeg" || file.type === "image/png");
        if (!isCorrect) {
            message.error("请上传JPG或PNG格式的图片");
            return Upload.LIST_IGNORE;
        }
        return isCorrect;
    }

    const publish = async () => { // 点击发布之后弹出模态框
        const ref = isAdd ? addCaseRef : editCaseRef;
        await ref.current.validateFields()
            .then(value => {
                if (content === "" || content.trim() === "<p></p>") {
                    message.info("请输入正文");
                    return;
                }
                if (fileList.length == 0 || value.img == undefined || fileList[0].response == undefined) {
                    message.info("请上传封面");
                    return;
                }
                setPublishVisiable(true); // 打开模态框
                Modal.confirm({
                    title: "你确定发布文章吗",
                    visible: publishVisiable,
                    onCancel: setPublishVisiable(false),
                    centered: true,
                    okText: "确定",
                    cancelText: "取消",
                    onOk: () => { // 发布案例
                        if (isAdd === true) {
                            submit();
                        }
                        if (isEdit === true) {
                            update();
                        }
                    }
                })
            })
    }

    const submit = async () => { // 添加案例
        await addCaseRef.current.validateFields()
            .then(value => {
                const event = {
                    name: value.name, // 标题
                    img: fileList[0].response.imgPath, // 图片
                    desc: value.desc, // 简介
                    content, // 内容
                }
                axios.post(`${HOST}:${PORT}/case/add`, { event })
                    .then(result => {
                        if (result.data.status === 201) {
                            message.success(result.data.msg); // 提示信息
                            setFileList([]); // 设置图片列表为空
                            setTimeout(() => {
                                setIsAdd(false); // 关闭添加页面
                                setIsCase(true); // 显示案例页面
                                setState(!state); // 刷新案例页面
                                setIsEdit(false); // 关闭编辑页面
                                setIsLook(false); // 关闭查看页面
                            }, 1000);
                        }
                    }).catch(err => {
                        console.log(err);
                    })
            })
    }

    const update = async () => { // 更新案例
        await editCaseRef.current.validateFields()
            .then(value => {
                const event = {
                    id: oneCase[0].id,
                    name: value.name, // 标题
                    img: fileList[0].response.imgPath, // 图片
                    desc: value.desc, // 简介
                    content, // 内容
                }
                axios.post(`${HOST}:${PORT}/case/modify`, { event })
                    .then(result => {
                        if (result.data.status === 201) {
                            message.success(result.data.msg); // 提示信息
                            setFileList([]); // 设置图片列表为空
                            setTimeout(() => {
                                setIsAdd(false); // 关闭添加页面
                                setIsCase(true); // 显示案例页面
                                setState(!state); // 刷新案例页面
                                setIsEdit(false); // 关闭编辑页面
                                setIsLook(false); // 关闭查看页面
                            }, 1000);
                        }
                    }).catch(err => {
                        console.log(err);
                    })
            })
    }

    const select = () => { // 搜索某个案例
        let name = document.getElementById("searchCase").value; // 获取输入框中值
        if (name == "") { // 输入框中的值为空
            setState(!state); // 刷新当前页面
        } else {
            axios.post(`${HOST}:${PORT}/case/some`, { name: name })
                .then(result => {
                    if (result.data.status === 200) {
                        setAllCase(result.data.data);
                    }
                    if (result.data.status === 404) {
                        message.info(result.data.msg);
                    }
                }).catch(err => {
                    console.log(err);
                })
        }
    }

    const confirmDelete = (caseId) => { // 询问是否确定删除
        Modal.confirm({
            title: "你确定删除该文章吗",
            icon: <ExclamationCircleOutlined />,
            okText: "确定",
            cancelText: "取消",
            centered: true,
            onOk: () => deleteCase(caseId)
        })
    }

    const deleteCase = async (caseId) => { // 删除案例
        axios.delete(`${HOST}:${PORT}/case/delete`, { data: { id: caseId } })
            .then(result => {
                if (result.data.status === 204) {
                    message.success(result.data.msg); // 删除成功提示
                    setState(!state); // 刷新当前的数据
                } else {
                    message.error("删除失败");
                }
            }).catch(err => {
                console.log(err);
            })
    }

    const getAllCase = () => { // 查询所有的案例
        axios.get(`${HOST}:${PORT}/case/all`)
            .then(result => {
                if (result.data.status === 200) {
                    setAllCase(result.data.data);
                }
            }).catch(err => {
                console.log(err);
            })
    }

    const getOneCase = (caseId) => { // 查询某个案例
        axios.post(`${HOST}:${PORT}/case/one`, { id: caseId })
            .then(result => {
                if (result.data.status === 200) {
                    setOneCase(result.data.data); // 将查询到的案例信息存储起来
                }
            }).catch(err => {
                console.log(err);
            })
    }

    const casePage = () => { // 显示所有案例主页面
        return (
            <div>
                <Input.Group compact>
                    <Input id={"searchCase"} style={{ width: "200px" }} placeholder={"请输入案例名称"} />&nbsp;&nbsp;&nbsp;
                    <Button type={"primary"} onClick={() => select()}>搜索</Button>&nbsp;&nbsp;&nbsp;
                    <Button type={"primary"} onClick={() => {
                        setIsCase(false); // 关闭案例页面
                        setIsAdd(true); // 打开添加页面
                        setIsEdit(false); // 不打开编辑页面
                    }}>添加</Button>
                </Input.Group>
                <List dataSource={allCase} itemLayout={"vertical"} size={"large"} style={{ marginTop: "20px" }}
                    pagination={{ pageSize: 5 }}
                    renderItem={item => (
                        <List.Item
                            key={item.id}
                            extra={<img width={272} height={153} alt={"cover"} src={item.img} />}
                            actions={[
                                <Button type="link" icon={<EyeOutlined />} onClick={() => {
                                    getOneCase(item.id); // 查询当前选择案例的内容
                                    setIsCase(false); // 关闭案例主页面
                                    setIsLook(true); // 打开查看页面
                                    setIsEdit(false); // 关闭编辑页面
                                    setIsAdd(false); // 关闭添加页面
                                }}>查看</Button>,
                                <Button type={"link"} icon={<EditOutlined />} onClick={async () => {
                                    await getOneCase(item.id); // 查询当前选择案例的内容
                                    await setIsCase(false); // 关闭全部案例页面
                                    await setIsEdit(true); // 打开编辑页面
                                    await setIsLook(false); // 关闭查看页面
                                    await setIsAdd(false); // 关闭添加案例页面
                                    // await setFileList({ uid: -1, url: oneCase[0] ? oneCase[0].img : "" })
                                }}>编辑</Button>,
                                <Button type={"link"} icon={<DeleteOutlined />} danger onClick={() => confirmDelete(item.id)}>删除</Button>
                            ]}
                        >
                            <List.Item.Meta
                                title={<span style={{ fontSize: "25px" }}>{item.name}</span>}
                                description={<span style={{ fontSize: "10px" }}>创建时间：{item.created_at}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;更新时间：{item.updated_at}</span>}
                            />
                            {item.desc}
                        </List.Item>
                    )}></List>
            </div>
        )
    }

    const look = () => { // 当点击某篇案例时打开该案例
        return (
            <div style={{ width: "100%" }}>
                <PageHeader onBack={() => {
                    setIsLook(false);
                    setIsCase(true);
                }} title={"返回"}>
                    <Descriptions>
                        <Descriptions.Item
                            label={"发布时间"}>{oneCase[0] ? oneCase[0].created_at : null}</Descriptions.Item>
                        <Descriptions.Item
                            label={"更新时间"}>{oneCase[0] ? oneCase[0].updated_at : null}</Descriptions.Item>
                    </Descriptions>
                    <Title level={2} style={{ textAlign: "center" }}>{oneCase[0] ? oneCase[0].name : null}</Title>
                    <div>{oneCase[0] ? (
                        <div dangerouslySetInnerHTML={{ __html: oneCase[0].content }}></div>
                    ) : null}</div>
                </PageHeader >
            </div>
        )
    }

    const addPage = () => { // 添加案例
        return (
            <div>
                <PageHeader className={"site-page-header"} onBack={() => back()} title={"添加案例"} extra={[
                    <Button key={1} type={"primary"} onClick={() => back()}>取消编辑</Button>,
                    <Button key={2} type={"primary"} onClick={() => publish()}>发布文章</Button>
                ]}>
                </PageHeader>
                <Form ref={addCaseRef}>
                    <Row align={"center"}>
                        <Col span={23}>
                            <Form.Item
                                name={"name"}
                                rules={[{ required: true, message: "请输入文章标题" }]}>
                                <Input
                                    placeholder={"请输入文章标题"}
                                    style={{ borderRadius: "24px", height: "40px", padding: "8px" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row align={"center"}>
                        <Col span={23}>
                            <Form.Item name={"braft"}>
                                <TextEditor placeholder="请输入正文" getContent={value => setContent(value)}></TextEditor>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row align={"center"}>
                        <Col span={3}>
                            <Form.Item name={"img"}>
                                <Upload action={`${HOST}:${PORT}/cate/upload`}
                                    name={"img"}
                                    listType={"picture-card"}
                                    fileList={fileList}
                                    onChange={handleImgChange}
                                    data={file => ({ photoContent: file })}
                                    onPreview={handlePreview}
                                    beforeUpload={beforeUpload}
                                    maxCount={1}>
                                    {fileList.length > 1 ? null : uploadButton}
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col span={13}>
                            <Form.Item name={"desc"} rules={[{ required: true, message: "请输入文章摘要" }]}>
                                <TextArea placeholder={"请输入文章摘要"} autoSize={{ minRows: 4, maxRows: 4 }}
                                    style={{ width: "700px" }} showCount maxLength={255}></TextArea>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                {/* 预览图片模态框 */}
                <Modal visible={previewVisiable} title={previewTitle}
                    onCancel={() => setPreviewVisiable(false)} footer={null}>
                    <img alt={"example"} style={{ width: "100%" }} src={previewImage} />
                </Modal>
            </div>
        )
    }

    const editPage = () => { // 编辑案例
        return (
            <div>
                <PageHeader className={"site-page-header"} onBack={() => back()} title={"编辑案例"} extra={[
                    <Button key={1} type={"primary"} onClick={() => back()}>取消编辑</Button>,
                    <Button key={2} type={"primary"} onClick={() => publish()}>发布文章</Button>
                ]}>
                </PageHeader>
                <Form ref={editCaseRef}>
                    <Row align={"center"}>
                        <Col span={23}>
                            <Form.Item
                                name={"name"}
                                initialValue={oneCase[0] ? oneCase[0].name : ""}
                                rules={[{ required: true, message: "请输入文章标题" }]}>
                                <Input placeholder={"请输入文章标题"}
                                    style={{ borderRadius: "24px", height: "40px", padding: "8px" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row align={"center"}>
                        <Col span={23}>
                            <Form.Item name={"braft"}>
                                <TextEditor placeholder="在这里输入正文" getContent={value => setContent(value)} content={oneCase[0] ? oneCase[0].content : undefined}></TextEditor>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row align={"center"}>
                        <Col span={3}>
                            <Form.Item
                                name={"img"}
                            >
                                <Upload action={`${HOST}:${PORT}/case/upload`} // 上传
                                    name={"img"} // 发到后台的文件参数名
                                    listType={"picture-card"}
                                    fileList={fileList} onChange={handleImgChange}
                                    data={file => ({ photoContent: file })} // 用户选择的文件
                                    onPreview={handlePreview} beforeUpload={beforeUpload}>
                                    {fileList.length >= 1 ? null : uploadButton}
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col span={13}>
                            <Form.Item
                                name={"desc"}
                                rules={[{ required: true, message: "请输入文章摘要" }]}
                                initialValue={oneCase[0] ? oneCase[0].desc : ""}
                            >
                                <TextArea placeholder={"请输入文章摘要"} autoSize={{ minRows: 4, maxRows: 4 }}
                                    style={{ width: "700px" }} showCount maxLength={255}></TextArea>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <Modal visible={previewVisiable} title={previewTitle}
                    onCancel={() => setPreviewVisiable(false)} footer={null}>
                    <img alt={"example"} style={{ width: "100%" }} src={previewImage} />
                </Modal>
            </div>
        )
    }

    useEffect(() => getAllCase(), [state]); // 刷新,重新获取全部的案例

    return (
        <div style={{ padding: "30px 20px" }}>
            {/* 显示所有案例 */}
            {isCase ? casePage() : null}
            {/* 显示添加案例 */}
            {isAdd ? addPage() : null}
            {/* 显示某个案例 */}
            {isLook ? look() : null}
            {/* 显示编辑案例 */}
            {isEdit ? editPage() : null}
        </div>
    )
}

export default Case;