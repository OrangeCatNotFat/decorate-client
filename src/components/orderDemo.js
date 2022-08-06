import React from "react";
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
// import {BrowserRouter} from "react-router-dom";
import { Button, Form, Input, message, Modal, Radio, Row, Col, Select, Space, Table } from "antd";
import axios from "axios";
import { HOST, PORT } from "../config/apiconfig";
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";


export const OrderDemo = () => {
    const [orders, setOrders] = React.useState([]); // 存放所有的订单数据，形式数组中存放对象
    const [state, setState] = React.useState(false); // 记录当前页面是否修改
    const [order, setOrder] = React.useState({}); // 记录要修改的订单的值
    const [modifyOrders, setModifyOrders] = React.useState(false); // 是否显示修改信息的模态框
    const [addOrders, setAddOrders] = React.useState(false); // 是否显示添加的模态框

    const modifyRef = React.createRef(); // 与修改模态框绑定
    const addRef = React.createRef(); // 与添加模态框绑定

    const { confirm } = Modal;

    // 打开模态框
    const showModifyModal = (record) => {
        console.log(record)
        setOrder(record);
        setModifyOrders(true);
    }
    const showAddModal = () => {
        setAddOrders(true);
    }

    // 关闭模态框
    const handleModifyCancel = () => {
        setModifyOrders(false);
    }
    const handleAddCancel = () => {
        setAddOrders(false);
    }


    const columns = [ // 定义表格的列
        {
            title: "编号",
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id,
            align: "center"
        },
        {
            title: "姓名",
            dataIndex: "name",
            key: "name",
            editable: true,
            align: "center"
        },
        {
            title: "电话",
            dataIndex: "phone",
            key: "phone",
            editable: true,
            align: "center"
        },
        {
            title: "装饰类型",
            dataIndex: "type",
            key: "type",
            editable: true,
            align: "center"
        },
        {
            title: "日期",
            dataIndex: "order_date",
            key: "order_date",
            align: "center"
        },
        {
            title: "留言",
            dataIndex: "message",
            key: "message",
            align: "center"
        },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            align: "center"
        },
        {
            title: "创建时间",
            dataIndex: "created_at",
            key: "created_at",
            align: "center"
        },
        {
            title: "更新时间",
            dataIndex: "updated_at",
            key: "updated_at",
            align: "center"
        },
        // sessionStorage.getItem("role") == 0 ?
        {
            title: "操作",
            key: "action",
            width: '30px',
            render: (text, record) => (
                <Space size={"middle"}>
                    <Button type={"link"} icon={<EditOutlined />}
                        onClick={() => showModifyModal(record)}>修改</Button>
                    <Button type={"link"} icon={<DeleteOutlined />} danger
                        onClick={() => showDeletConfirm(record.id)}>删除</Button>
                </Space>
            )

        }
    ];

    // 查询所有的订单
    const allOrder = () => {
        axios.get(`${HOST}:${PORT}/orders/all`)
            .then(result => {
                if (result.data.status === 200) {
                    setOrders(result.data.data);
                }
                if (result.data.status === 400) {
                    message.error(result.data.msg);
                }
            })
    }

    // 添加订单
    const addOrder = async () => {
        await addRef.current.validateFields() // 获取表单中的值
            .then(value => {
                axios.post(`${HOST}:${PORT}/orders/add`, { content: value })
                    .then(result => {
                        if (result.data.status === 201) {
                            message.success(result.data.msg);
                            setAddOrders(false);
                            setState(!state);
                        } else {
                            message.error("添加失败");
                        }
                    }).catch(err => {
                        console.log(err);
                    })
            })
    }

    const modify = async () => { // 修改订单信息
        await modifyRef.current.validateFields()
            .then(value => { // 修改后的数据
                axios.put(`${HOST}:${PORT}/orders/modify`, { user: value, id: order.id })
                    .then(result => {
                        if (result.data.status === 201) {
                            message.success(result.data.msg);
                            setModifyOrders(false);
                            setState(!state);
                        }
                    }).catch(err => {
                        console.log(err);
                    })
            })
    }

    const deleteOrder = (id) => { // 删除某个订单
        // console.log(typeof id) // id是获取到的索引number类型
        axios.delete(`${HOST}:${PORT}/orders/delete`, { data: { id: id } })
            .then(result => {
                // console.log(result);
                if (result.data.status === 204) {
                    setState(!state); // 刷新
                    message.success(result.data.msg);
                } else {
                    message.error("删除失败");
                }
            }).catch(err => {
                console.log(err);
            })
    }

    const showModifyConfirm = () => { // 修改时弹出的确定框
        confirm({
            title: "确定修改",
            icon: <ExclamationCircleOutlined />,
            onOk() {
                modify()
            },
            okText: "确定",
            cancelText: "取消",
            centered: true
        })
    }

    const showDeletConfirm = (id) => { // 删除时弹出的提示框
        confirm({
            title: "确定删除",
            icon: <ExclamationCircleOutlined />,
            onOk() {
                deleteOrder(id);
            },
            okText: "删除",
            cancelText: "取消",
            centered: true,
            okType: "danger"
        })
    }

    const showAddConfirm = async () => { // 添加订单信息询问框
        confirm({
            title: "添加订单",
            icon: <InfoCircleOutlined />,
            onOk() {
                addOrder();
            },
            okText: "添加",
            cancelText: "取消",
            centered: true
        })
    }

    const onSearch = () => { // 搜索订单信息
        let value = document.getElementById("input").value; // 获取输入框的值
        if (value == "") {
            setState(!state);
            return;
        }
        axios.get(`${HOST}:${PORT}/orders/one`, { params: { name: value } })
            .then(result => {
                if (result.data.status === 200) {
                    setOrders(result.data.data);
                }
            }).catch(err => {
                console.log(err);
            })
    }

    React.useEffect(() => allOrder(), [state]); // 设置刷新当前页面的条件

    return (
        // <BrowserRouter>
        <div style={{ padding: "30px 20px" }}>
            {/*搜索添加*/}
            <Input.Group compact style={{ display: "flex" }} className={"select"}>
                <div width={100}>
                    <Input id={'input'} placeholder="请输入查询名称" prefix={<UserOutlined />} />
                </div>
                <Button type="primary" icon={<SearchOutlined />} onClick={() => onSearch()}>
                </Button>
                &nbsp;&nbsp;&nbsp;
                {/*控制添加按钮显示*/}
                <Button type="primary" onClick={() => showAddModal()}>添加</Button>
            </Input.Group>

            <Table rowKey={record => record.id} columns={columns} dataSource={orders}
                style={{ marginTop: "20px" }} pagination={{
                    pageSize: 5, // 每页显示条数
                    hideOnSinglePage: true, // 一页时不隐藏分页器，
                    showQuickJumper: true,
                }}></Table>

            <Modal title={"修改订单信息"} visible={modifyOrders} okText={"修改"} cancelText={"取消"}
                onCancel={handleModifyCancel}
                destroyOnClose onOk={() => showModifyConfirm()} centered={true}>
                <Form ref={modifyRef}>
                    <Form.Item label='预约名称' name='name' initialValue={order.name}
                        rules={[{
                            required: true,
                            message: '请输入预约名称'
                        }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="联系方式" name="phone" initialValue={order.phone}
                        rules={[
                            {
                                required: true,
                                pattern: /^1[3|4|5|7|8][0-9]{9}$/,
                                message: '请输入正确的联系方式'
                            }
                        ]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label='装饰类型' name='type' initialValue={order.type}
                        rules={[{
                            required: true,
                            message: '请选择装饰类型'
                        }]}>
                        <Select>
                            <Select.Option value="楼房">楼房</Select.Option>
                            <Select.Option value="别墅">别墅</Select.Option>
                            <Select.Option value="小洋楼">小洋楼</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label='&nbsp;&nbsp;备&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;注' name='message' initialValue={order.message}>
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item label='状&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;态' name='status' initialValue={order.status}
                        rules={[{
                            required: true,
                            message: "请选择状态"
                        }]}
                    >
                        <Radio.Group>
                            <Radio value={0}>完成</Radio>
                            <Radio value={1}>待完成</Radio>
                            <Radio value={2}>未完成</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 添加订单模态框 */}
            <Modal title={"添加订单"} visible={addOrders} okText={"添加"} cancelText={"取消"} onCancel={handleAddCancel}
                destroyOnClose centered={true} onOk={() => showAddConfirm()}>
                <Form ref={addRef}>
                    <Form.Item label='预约名称' name='name'
                        rules={[{
                            required: true,
                            message: '请输入预约名称'
                        }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="联系方式" name="phone"
                        rules={[
                            {
                                required: true,
                                pattern: /^1[3|4|5|7|8][0-9]{9}$/,
                                message: '请输入正确的联系方式'
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label='装饰类型' name='type' initialValue={"楼房"}
                        rules={[{
                            required: true,
                            message: '请选择装饰类型'
                        }]}
                    >
                        <Select>
                            <Select.Option value="楼房">楼房</Select.Option>
                            <Select.Option value="别墅">别墅</Select.Option>
                            <Select.Option value="小洋楼">小洋楼</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label='&nbsp;&nbsp;备&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;注' name='message'>
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item label='状&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;态' name='status'
                        rules={[{
                            required: true,
                            message: '请选择状态'
                        }]}>
                        <Radio.Group>
                            <Radio value="0">完成</Radio>
                            <Radio value="1">待完成</Radio>
                            <Radio value="2">未完成</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
        // </BrowserRouter>
    )
}