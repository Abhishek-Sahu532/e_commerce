import React, { useEffect } from "react";
import './dashboard.css';
import Sidebar from "./Sidebar.js";
import { Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
// import { Doughnut, Line } from 'react-chartjs-2';
import { getAdminProducts, clearErrors } from "../../actions/productAction";
import { useSelector, useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import { getAllOrders } from "../../actions/orderAction.js";
import { getAllUsers } from "../../actions/userAction.js";

const Dashboard = () => {

    const dispatch = useDispatch();
    const alert = useAlert();
    const {  products } = useSelector((state) => state.products);
    const { orders } = useSelector((state) => state.allOrders);
    const { users } = useSelector((state) => state.allUsers);
 
    let outOfStock = 0; //how many products are out of stock;
    products && products.forEach((item) => {
        if (item.stock === 0) {
            outOfStock += 1;
        }
    });

    useEffect(() => {
        dispatch(getAdminProducts());
        dispatch(getAllOrders())
        dispatch(getAllUsers())
    }, [error, dispatch, alert])

    // const lineState = {
    //     labels: ['Initial Amount', 'Amount Earned'],
    //     datasets: [
    //         {
    //             label: 'TOTAL AMOUNT',
    //             backgroundColor: ['tomato'],
    //             hoverBackgroundColor: ['rgb(198,72,49)'],
    //             data: [0, 4000],
    //         }
    //     ]
    // };
    // const doughnutState = {
    //     labels: ['Out of Stock', 'InStock'],
    //     datasets: [
    //         {
    //             backgroundColor: ['#00a684', "#6800b4"],
    //             hoverBackgroundColor: ['#4b5000', '#35014f'],
    //             data: [outOfStock, products.length - outOfStock]
    //         },
    //     ]
    // };


    return (
        <div className="dashboard">
            <Sidebar />
            <div className="dashboardContainer">
                <Typography component='h1'>Dashboard</Typography>

                <div className="dashboardSummary">
                    <div>
                        <p>
                            Total Amount <br /> Rs 2000
                        </p>
                    </div>
                    <div className="dashboardSummaryBox2">
                        <Link to='/admin/products'>
                            <p>Product</p>
                            <p>{products && products.length}</p>
                        </Link>
                        <Link to='/admin/orders'>
                            <p>Orders</p>
                            <p>{orders && orders.length }</p>
                        </Link>
                        <Link to='/admin/users'>
                            <p>Users</p>
                            <p>{users && users.length}</p>
                        </Link>

                    </div>
                </div>

                {/* <div className="lineChart">
                    <Line data={lineState} />
                </div>

                <div className="doughnutChart">
                    <Doughnut data={doughnutState} />
                </div> */}

            </div>
        </div>
    )
}

export default Dashboard;