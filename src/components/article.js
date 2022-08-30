import React from "react";
import { Button, Col, Drawer, Form, Input, List, message, Modal, Row, Select, Space, Tag, Upload, Descriptions } from "antd";
import axios from "axios";
import { HOST, PORT } from "../config/apiconfig";
import TextEditor from "./editor";
import "braft-editor/dist/index.css";
import { DeleteOutlined, EditOutlined, PlusOutlined, EyeOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";

class Article extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allCate: [], // 存放所有的类别
            objCate: {}, // 存放类别对象，用来显示标签
            allArticle: [], // 存放所有的文章
            selectedValue: "", // 记录当前选择器是文章标题还是文章类别
            selectedCate: "", // 记录当前被选中的类别
            addVisiable: false, // 记录添加抽屉是否打开
            editVisiable: false, // 记录编辑抽屉是否打开
            lookVisiable: false, // 记录查看抽屉是否打开
            lookArticle: {}, // 记录当前查看的文章信息
            fileList: [], // 图片文件列表
            previewVisiable: false, // 是否预览图片文件
            previewTitle: "", // 预览模态框上标题
            previewImage: "", // 预览的图片文件
            content: "" // 记录富文本编辑器的内容
        }
    }

    addRef = React.createRef(); // 操作添加表单
    editRef = React.createRef(); // 操作编辑表单

    getBase64 = (file) => { // 读取图片文件
        return new Promise((resolve, reject) => {
            const reader = new FileReader(); // 创建读取文件的对象
            reader.readAsDataURL(file); // 读取文件的url
            reader.onload = () => resolve(reader.result); // 返回文件内容
            reader.onerror = (err) => reject(err);
        })
    }

    beforeUpload = (file) => { // 对图片格式进行校验
        const isCorrect = (file.type === "image/jpeg" || file.type === "image/png"); // 判断图片格式是否正确
        if (!isCorrect) { // 如果不正确
            message.info("请上传JPG或PNG格式的图片");
            return Upload.LIST_IGNORE; // 阻止上传
        }
        return isCorrect;
    }

    handlePreview = async (file) => { // 图片预览功能
        if (!file.url && !file.preview) { // 如果文件没有打开且没有预览，打开并预览
            file.preview = await this.getBase64(file.originFileObj);
        }
        this.setState({
            previewVisiable: true, // 打开预览模态框
            previewTitle: file.name || file.url.substring(file.url.lastIndexOf("/") + 1), // 设置标题
            previewImage: file.url || file.preview, // 设置预览图片
        })
    }

    handleImageChange = ({ fileList }) => { // 设置上传的图片列表
        this.setState({
            fileList: fileList
        })
    }

    searchInformation = () => { // 搜索文章信息
        if (this.state.selectedValue == "cate") { // 按类别搜索文章
            axios.post(`${HOST}:${PORT}/article/cate`, { cate: this.state.selectedCate })
                .then(result => {
                    if (result.data.status === 200) {
                        this.setState({
                            allArticle: result.data.data
                        })
                    }
                }).catch(err => {
                    console.log(err);
                })
        } else { // 使用文章标题搜索
            let value = document.getElementById("input").value; // 获取输入框的值
            if (value == "") { // 搜索框为空搜索全部内容
                this.getAllArticle();
                return;
            }
            axios.post(`${HOST}:${PORT}/article/some`, { title: value })
                .then(result => {
                    if (result.data.status === 200) {
                        this.setState({
                            allArticle: result.data.data
                        })
                    }
                }).catch(err => {
                    console.log(err);
                })
        }
    }

    confirmAdd = () => { // 确定是否添加类别模态框
        Modal.confirm({
            title: "确定发布文章",
            okText: "确定",
            cancelText: "取消",
            centered: true,
            onOk: this.addArticle
        })
    }

    confirmEdit = () => { // 确定是否编辑类别模态框
        Modal.confirm({
            title: "确定发布文章",
            okText: "确定",
            cancelText: "取消",
            centered: true,
            onOk: this.editArticle
        })
    }

    confirmDelete = (aId) => { // 确定是否删除文章
        Modal.confirm({
            title: "你确定删除这篇文章吗",
            icon: <ExclamationCircleOutlined />,
            okText: "确定",
            cancelText: "取消",
            centered: true,
            onOk: () => this.deleteCase(aId)
        })
    }

    getAllCate = () => { // 获取所有的类别
        axios.get(`${HOST}:${PORT}/cate/all`)
            .then(result => {
                if (result.data.status === 200) {
                    let obj = {};
                    for (let i of result.data.data) {
                        obj[i.id] = i.name;
                    }
                    this.setState({
                        allCate: result.data.data.map(item => {
                            return {
                                id: item.id,
                                name: item.name
                            }
                        }),
                        objCate: obj
                    })
                }
            }).catch(err => {
                console.log(err);
            })
    }

    getAllArticle = () => { // 获取所有的文章信息
        axios.get(`${HOST}:${PORT}/article/all`)
            .then(result => {
                if (result.data.status === 200) {
                    this.setState({
                        allArticle: result.data.data
                    })
                }
            }).catch(err => {
                console.log(err);
            })
    }

    openLookDrawer = async (aId) => { // 打开查看文章抽屉
        this.setState({
            lookVisiable: true,
        })
        this.getOneArticle(aId);
    }

    openEditDrawer = async (aId) => { // 打开编辑文章抽屉
        await this.getOneArticle(aId); // 获取当前文章信息放在lookArticle
        this.setState({
            editVisiable: true,
            fileList: [{
                uid: this.state.lookArticle.id,
                url: this.state.lookArticle.cover
            }],
            content: this.state.lookArticle.content
        })
    }

    getOneArticle = async (aId) => { // 查询某篇文章信息
        await axios.post(`${HOST}:${PORT}/article/one`, { id: aId })
            .then(result => {
                if (result.data.status === 200) {
                    this.setState({
                        lookArticle: result.data.data // 获取到文章信息
                    })
                }
            }).catch(err => {
                console.log(err);
            })
    }

    addArticle = async () => { // 添加文章
        try {
            await this.addRef.current.validateFields()
                .then(value => {
                    axios.post(`${HOST}:${PORT}/article/add`, {
                        event: {
                            title: value.title,
                            cate: value.cate,
                            desc: value.desc,
                            cover: this.state.fileList[0].response.imgPath,
                            content: this.state.content
                        }
                    }).then(result => {
                        if (result.data.status === 201) {
                            message.success(result.data.msg);
                            this.setState({
                                addVisiable: false, // 关闭添加抽屉
                                fileList: [] // 将图片列表制空
                            })
                            this.getAllArticle();
                        }
                    })
                })
        } catch (err) {
            throw err;
        }
    }

    editArticle = async () => { // 编辑文章
        try {
            await this.editRef.current.validateFields()
                .then(value => {
                    axios.post(`${HOST}:${PORT}/article/modify`, {
                        event: {
                            id: this.state.lookArticle.id,
                            title: value.title,
                            cate: value.cate,
                            desc: value.desc,
                            cover: this.state.fileList[0].response ? this.state.fileList[0].response.imgPath : this.state.fileList[0].url,
                            content: this.state.content
                        }
                    }).then(result => {
                        if (result.data.status === 201) {
                            message.success(result.data.msg);
                            this.setState({
                                editVisiable: false, // 关闭添加抽屉
                                fileList: [] // 将图片列表制空
                            })
                            this.getAllArticle();
                        }
                    })
                })
        } catch (err) {
            throw err;
        }
    }

    getDefaultCate = (allCate, cate) => { // 获取默认的类别
        for (let i = 0; i < allCate.length; i++) {
            if (allCate[i].id === cate) {
                return allCate[i].name;
            }
        }
    }

    deleteCase = (aId) => { // 删除当前文章
        axios.delete(`${HOST}:${PORT}/article/del`, { data: { id: aId } })
            .then(result => {
                if (result.data.status === 204) {
                    message.success(result.data.msg); // 删除成功提示
                    this.getAllArticle(); // 刷新当前的文章
                } else {
                    message.error("删除失败");
                }
            }).catch(err => {
                console.log(err);
            })
    }

    getCateTagColor = (allCate, cate) => { // 获取当前类别的颜色
        const tagColors = ["magenta", "red", "volcano", "orange", "gold", "lime", "green", "cyan", "blue", "geekblue", "purple"];

        for (let i = 0; i < allCate.length; i++) {
            if (allCate[i].id === cate) {
                return tagColors[i]; // 返回当前颜色
            }
        }
    }

    componentDidMount() { // 页面加载完成后执行
        this.getAllArticle(); // 获取所有的文章信息
        this.getAllCate(); // 获取所有的类别
    }

    render() {
        const { allCate, selectedValue } = this.state;

        const uploadButton = ( // 定义未上传时显示的按钮
            <div>
                <PlusOutlined />
                <div style={{ marginTop: "8px" }}>上传封面</div>
            </div>);

        // 标签的颜色
        const tagColors = ["magenta", "red", "volcano", "orange", "gold", "lime", "green", "cyan", "blue", "geekblue", "purple"];

        return (
            <div style={{ padding: "30px 20px" }}>
                {/* 按钮组 */}
                <div style={{ width: "40%" }}>
                    <Input.Group compact style={{ display: "flex" }} className={"select"}>
                        <Select defaultValue={"title"} onChange={value => { // 当变化时调用
                            // value是cate和title
                            this.setState({
                                selectedValue: value
                            })
                            this.getAllArticle(); // 切换时刷新文章
                        }}>
                            <Select.Option value={"title"}>文章标题</Select.Option>
                            <Select.Option value={"cate"}>文章类别</Select.Option>
                        </Select>
                        {selectedValue == "cate" ? (
                            <Select style={{ width: "200px" }} defaultValue={allCate[0].id} onChange={value => {
                                // value是当前被选中的类别
                                this.setState({
                                    selectedCate: value
                                })
                            }}>
                                {allCate.map(item => {
                                    return (
                                        <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
                                    )
                                })}
                            </Select>
                        ) : (<Input style={{ width: "200px" }} id={"input"} />)}&nbsp;&nbsp;&nbsp;
                        <Button type={"primary"} onClick={() => this.searchInformation()}>搜索</Button>&nbsp;&nbsp;&nbsp;
                        <Button type={"primary"} onClick={() => this.setState({ addVisiable: true })}>添加</Button>
                    </Input.Group>
                </div>
                {/* 文章列表 */}
                <List dataSource={this.state.allArticle} itemLayout={"vertical"} size={"large"}
                    style={{ marginTop: "20px" }}
                    renderItem={item => (
                        <List.Item key={item.id}
                            actions={[
                                <Button type={"link"} icon={<EyeOutlined />} onClick={() => this.openLookDrawer(item.id)}>查看</Button>,
                                <Button type={"link"} icon={<EditOutlined />} onClick={() => this.openEditDrawer(item.id)}>编辑</Button>,
                                <Button type={"link"} icon={<DeleteOutlined />} danger onClick={() => this.confirmDelete(item.id)}>删除</Button>,
                            ]}
                            extra={<img width={272} height={153} alt={"logo"} src={item.cover} />}>
                            <List.Item.Meta title={<span style={{ fontSize: "25px" }}>{item.title}</span>}
                                description={<span style={{ fontSize: "10px" }}>创建时间：{item.created_at}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;更新时间：{item.updated_at}</span>}
                            />
                            <Tag color={this.getCateTagColor(allCate, item.cate)}>{this.state.objCate[item.cate]}</Tag>
                            {item.desc}
                        </List.Item>
                    )}
                >
                </List>
                {/* 添加文章抽屉 */}
                <Drawer width={"80%"} visible={this.state.addVisiable}
                    onClose={() => this.setState({ addVisiable: false, fileList: [] })}
                    title={"添加文章"}
                    extra={
                        <Space>
                            <Button type={"primary"} onClick={this.confirmAdd}>发布文章</Button>
                            <Button type={"primary"}
                                onClick={() => this.setState({
                                    addVisiable: false,
                                    fileList: []
                                })}>取消编辑</Button>
                        </Space>
                    }
                    destroyOnClose={true}>
                    <Form ref={this.addRef} layout={"vertical"} hideRequiredMark>
                        <Row>
                            <Col span={24}>
                                <Form.Item name={"title"} rules={[{ required: true, message: "请输入文章标题" }]}
                                    initialValue={"【无标题】"}>
                                    <Input placeholder={"请输入文章标题"} size={"large"}
                                        style={{ borderRadius: "20px" }} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item name={"content"}>
                                    <TextEditor placeholder="在这里输入正文" getContent={value => this.setState({ content: value })} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6}>
                                <Form.Item name={"cate"} rules={[{ required: true, message: "请选择类别" }]}
                                    label={"文章类别"}>
                                    <Select style={{ width: "200px" }}>
                                        {allCate.map(item => {
                                            return (
                                                <Select.Option value={item.id}
                                                    key={item.id}>{item.name}</Select.Option>
                                            )
                                        })}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item name={"cover"} rules={[{ required: true }]}>
                                    <Upload action={`${HOST}:${PORT}/cate/upload`}
                                        name={"cover"}
                                        listType={"picture-card"}
                                        fileList={this.state.fileList}
                                        onChange={this.handleImageChange}
                                        data={file => ({ photoContent: file })}
                                        onPreview={this.handlePreview}
                                        beforeUpload={this.beforeUpload}
                                        maxCount={1}>
                                        {this.state.fileList.length > 1 ? null : uploadButton}
                                    </Upload>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name={"desc"} rules={[{ required: true, message: "请输入文章摘要" }]}>
                                    <TextArea placeholder={"请输入文章摘要"} autoSize={{ minRows: 4, maxRows: 4 }}
                                        style={{ width: "500px" }} showCount maxLength={255}></TextArea>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Drawer>
                {/* 查看文章的抽屉 */}
                <Drawer width={"80%"} visible={this.state.lookVisiable}
                    onClose={() => this.setState({ lookVisiable: false, lookArticle: {} })}
                    title={"文章详情"}
                >
                    <Descriptions>
                        <Descriptions.Item
                            label={"发布时间"}>{this.state.lookArticle.created_at}</Descriptions.Item>
                        <Descriptions.Item
                            label={"更新时间"}>{this.state.lookArticle.updated_at}</Descriptions.Item>
                        <Descriptions.Item
                            label={"文章类别"}><Tag color={this.getCateTagColor(allCate, this.state.lookArticle.cate)}>{this.state.objCate[this.state.lookArticle.cate]}</Tag></Descriptions.Item>
                    </Descriptions>
                    <Title level={2} style={{ textAlign: "center" }}>{this.state.lookArticle.title}</Title>
                    <div dangerouslySetInnerHTML={{ __html: this.state.lookArticle.content }}></div>
                </Drawer>
                {/* 编辑文章抽屉 */}
                <Drawer width={"80%"} visible={this.state.editVisiable}
                    onClose={() => this.setState({ editVisiable: false, fileList: [] })}
                    title={"编辑文章"}
                    extra={
                        <Space>
                            <Button type={"primary"} onClick={this.confirmEdit}>发布文章</Button>
                            <Button type={"primary"}
                                onClick={() => this.setState({
                                    editVisiable: false,
                                    fileList: []
                                })}>取消编辑</Button>
                        </Space>
                    }
                    destroyOnClose={true}>
                    <Form ref={this.editRef} layout={"vertical"} hideRequiredMark>
                        <Row>
                            <Col span={24}>
                                <Form.Item name={"title"} rules={[{ required: true, message: "请输入文章标题" }]}
                                    initialValue={this.state.lookArticle.title}>
                                    <Input placeholder={"请输入文章标题"} size={"large"}
                                        style={{ borderRadius: "20px" }} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item name={"content"}>
                                    <TextEditor placeholder="在这里输入正文" getContent={value => this.setState({ content: value })} content={this.state.lookArticle.content} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6}>
                                <Form.Item name={"cate"}
                                    label={"文章类别"}>
                                    <Select style={{ width: "200px" }} defaultValue={this.getDefaultCate(allCate, this.state.lookArticle.cate)}>
                                        {allCate.map(item => { // allCate类别数组
                                            return (
                                                <Select.Option value={item.id}
                                                    key={item.id}>{item.name}</Select.Option>
                                            )
                                        })}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item name={"cover"}>
                                    <Upload action={`${HOST}:${PORT}/cate/upload`}
                                        name={"cover"}
                                        listType={"picture-card"}
                                        fileList={this.state.fileList}
                                        onChange={this.handleImageChange}
                                        data={file => ({ photoContent: file })}
                                        onPreview={this.handlePreview}
                                        beforeUpload={this.beforeUpload}
                                        maxCount={1}>
                                        {this.state.fileList.length > 1 ? null : uploadButton}
                                    </Upload>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name={"desc"} rules={[{ required: true, message: "请输入文章摘要" }]} initialValue={this.state.lookArticle.desc}>
                                    <TextArea placeholder={"请输入文章摘要"} autoSize={{ minRows: 4, maxRows: 4 }}
                                        style={{ width: "500px" }} showCount maxLength={255}></TextArea>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Drawer>
            </div >
        )
    }
}

export default Article;