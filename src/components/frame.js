import React from "react";
import {Layout, Menu, Dropdown, Button} from "antd";
import {BrowserRouter, HashRouter, NavLink, Redirect, Route, Switch} from "react-router-dom";
import {
    AppstoreFilled,
    BarsOutlined,
    CaretDownOutlined, DownOutlined, FileTextOutlined,
    GiftOutlined,
    HomeOutlined, PictureOutlined, SettingOutlined, TagsOutlined, TeamOutlined
} from "@ant-design/icons";
import Case from "./case";
import Home from "./home";
import Cate from "./cate";
import {Administrator} from "./administrator";
import Article from "./article";
import {HOST, PORT} from "../config/apiconfig";
import NotFound from "./notfound";

const {Header, Content, Sider} = Layout;

class Frame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 1 // 记录点击到了哪个页面
        }
    }

    // 个人信息下拉框
    DownMenu = () => {
        return (
            <Menu>
                <Menu.Item key={"1"}>
                    <a href={`${HOST}:3000`}>退出登录</a>
                </Menu.Item>
            </Menu>
        )
    }

    // 标签选项
    TagSelectMenu = () => {
        return (
            // 编写onClick事件
            <Menu>
                <Menu.Item key={"1"}>清空标签</Menu.Item>
                <Menu.Item key={"2"}>2</Menu.Item>
            </Menu>
        )
    }

    render() {
        const key = this.state.key;
        const pageTitle = [
            <div style={{color: "rgb(147,147,147)", fontSize: "18px", fontFamily: "微软雅黑"}}>
                <HomeOutlined/>&nbsp;&nbsp;系统首页</div>,
            <div style={{color: "rgb(147,147,147)", fontSize: "18px", fontFamily: "微软雅黑"}}>
                <BarsOutlined/>&nbsp;&nbsp;预约管理</div>,
            <div style={{color: "rgb(147,147,147)", fontSize: "18px", fontFamily: "微软雅黑"}}>
                <GiftOutlined/>&nbsp;&nbsp;活动管理</div>,
            <div style={{color: "rgb(147,147,147)", fontSize: "18px", fontFamily: "微软雅黑"}}>
                <TagsOutlined/>&nbsp;&nbsp;分类管理</div>,
            <div style={{color: "rgb(147,147,147)", fontSize: "18px", fontFamily: "微软雅黑"}}>
                <FileTextOutlined/>&nbsp;&nbsp;文章管理</div>,
            <div style={{color: "rgb(147,147,147)", fontSize: "18px", fontFamily: "微软雅黑"}}>
                <PictureOutlined/>&nbsp;&nbsp;案例管理</div>,
            <div style={{color: "rgb(147,147,147)", fontSize: "18px", fontFamily: "微软雅黑"}}>
                <SettingOutlined/>&nbsp;&nbsp;企业信息管理</div>,
            <div style={{color: "rgb(147,147,147)", fontSize: "18px", fontFamily: "微软雅黑"}}>
                <TeamOutlined/>&nbsp;&nbsp;管理员管理</div>
        ]
        return (
            // BrowserRouter表示使用了history模式的路由，必须放在最外
            // 使用顶部——侧边栏——通栏的布局
            <div className={"container"}>
                <Header className={"header"}>
                    <AppstoreFilled style={{color: "white", fontSize: "30px", marginTop: "17px", float: "left"}}/>
                    <div style={{
                        color: "white",
                        fontFamily: "微软雅黑",
                        fontSize: "25px",
                        float: "left",
                        marginLeft: "30px"
                    }}>创客装修后台管理系统
                    </div>
                    <Dropdown overlay={this.DownMenu} trigger={["click"]}>
                        <a className={"ant-dropdown-link"} onClick={e => e.preventDefault()}
                           style={{color: "white", float: "right"}}>
                            {sessionStorage.getItem("username")}<CaretDownOutlined/>
                        </a>
                    </Dropdown>
                </Header>
                <Layout style={{
                    position: "fixed",
                    width: "100%",
                    height: "91%",
                    overflow: "auto"
                }}>
                    <Sider width={200} className={"site-layout-background"}
                           style={{backgroundColor: "white"}}>
                        <Menu mode={"inline"} defaultSelectedKeys={["1"]} defaultOpenKeys={["1"]}
                              style={{height: "100%", borderRight: 0}}
                              onClick={async key => {
                                  await this.setState({
                                      key: key.key
                                  })
                              }}>
                            <Menu.Item key={"1"} style={{marginTop: 0}}>
                                <NavLink to={"/home/my"}>
                                    <HomeOutlined/>&nbsp;&nbsp;系统首页
                                </NavLink>
                            </Menu.Item>
                            <Menu.Item key={"2"}>
                                <NavLink to={"/home/orders"}>
                                    <BarsOutlined/>&nbsp;&nbsp;预约管理
                                </NavLink>
                            </Menu.Item>
                            <Menu.Item key={"3"}>
                                <NavLink to={"/home/active"}>
                                    <GiftOutlined/>&nbsp;&nbsp;活动管理
                                </NavLink>
                            </Menu.Item>
                            <Menu.Item key={"4"}>
                                <NavLink to={"/home/cate"}>
                                    <TagsOutlined/>&nbsp;&nbsp;分类管理
                                </NavLink>
                            </Menu.Item>
                            <Menu.Item key={"5"}>
                                <NavLink to={"/home/article"}>
                                    <FileTextOutlined/>&nbsp;&nbsp;文章管理
                                </NavLink>
                            </Menu.Item>
                            <Menu.Item key={"6"}>
                                <NavLink to={"/home/case"}>
                                    <PictureOutlined/>&nbsp;&nbsp;案例管理
                                </NavLink>
                            </Menu.Item>
                            <Menu.Item key={"7"}>
                                <NavLink to={"/home/info"}>
                                    <SettingOutlined/>&nbsp;&nbsp;企业信息管理
                                </NavLink>
                            </Menu.Item>
                            <Menu.Item key={"8"}>
                                <NavLink to={"/home/administrator"}>
                                    <TeamOutlined/>&nbsp;&nbsp;管理员管理
                                </NavLink>
                            </Menu.Item>
                        </Menu>
                    </Sider>
                    <Layout style={{
                        padding: "20px 24px 50px",
                        minHeight: "400px"
                    }}>
                        <div>{pageTitle[key - 1]}</div>
                        {/*导航栏旁边的区域*/}
                        <Content className={"site-layout-background"}
                                 style={{
                                     marginTop: "10px",
                                     backgroundColor: "white",
                                     height: "500px",
                                     overflow: "auto"
                                 }}>
                            <Switch>
                                <Route path={"/home/my"} component={Home}></Route>
                                <Route path={"/home/orders"}></Route>
                                <Route path={"/home/active"}></Route>
                                <Route path={"/home/case"} component={Case}></Route>
                                <Route path={"/home/article"} component={Article}></Route>
                                <Route path={"/home/info"}></Route>
                                <Route path={"/home/cate"} component={Cate}></Route>
                                <Route path={"/home/administrator"} component={Administrator}></Route>
                                <Redirect from={"/home"} to={"/home/my"}/>
                            </Switch>
                        </Content>
                    </Layout>
                </Layout>
            </div>
        );
    }
}

export default Frame;

