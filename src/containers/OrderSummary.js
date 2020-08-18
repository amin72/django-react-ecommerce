import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {
    Container,
    Header,
    Button,
    Label,
    Table,
    Message,
    Segment,
    Dimmer,
    Loader,
    Image
} from 'semantic-ui-react'
import { ORDER_SUMNARY_URL } from '../constants';
import { authAxios } from '../utils'


class OrderSummary extends Component {

    state = {
        data: null,
        error: null,
        loading: false
    }


    componentDidMount() {
        this.handelFetchOrder()
    }


    handelFetchOrder = () => {
        this.setState({
            loading: true
        })

        authAxios.get(ORDER_SUMNARY_URL)
            .then(res => {
                this.setState({
                    data: res.data,
                    loading: false
                })
            }).catch(err => {
                if (err.response.status === 404) {
                    this.setState({
                        error: "You currently do not have an order",
                        loading: false
                    })
                } else {
                    this.setState({
                        error: err,
                        loading: false
                    })
                }
            })
    }


    render() {
        const { data, error, loading } = this.state

        return (
            <Container>
                <Header as="h3">Order Summary</Header>
                {error && (
                    <Message
                        error
                        header="There was an error"
                        content={JSON.stringify(error)}
                    />
                )}
                {loading && (
                    <Segment>
                        <Dimmer active inverted>
                            <Loader inverted>Loading</Loader>
                        </Dimmer>

                        <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                    </Segment>
                )}
                {data && (

                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Item #</Table.HeaderCell>
                                <Table.HeaderCell>Item name</Table.HeaderCell>
                                <Table.HeaderCell>Item price</Table.HeaderCell>
                                <Table.HeaderCell>Item quantity</Table.HeaderCell>
                                <Table.HeaderCell>Total item price</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {data && data.order_items.map((order_item, i) => (
                                <Table.Row key={order_item.id}>
                                    <Table.Cell>{i + 1}</Table.Cell>
                                    <Table.Cell>{order_item.item.title}</Table.Cell>
                                    <Table.Cell>${order_item.item.price}</Table.Cell>
                                    <Table.Cell>{order_item.quantity}</Table.Cell>
                                    <Table.Cell>
                                        {order_item.item.discount_price && (
                                            <Label color='green' ribbon>ON DISCOUNT</Label>
                                        )}
                                    ${order_item.final_price}
                                    </Table.Cell>
                                </Table.Row>
                            ))}

                            <Table.Row>
                                <Table.Cell />
                                <Table.Cell />
                                <Table.Cell />
                                <Table.Cell colSpan='2' textAlign='center'>
                                    Total: ${data && data.total}
                                </Table.Cell>
                            </Table.Row>


                        </Table.Body>

                        <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell colSpan='5' textAlign='right'>
                                    <Link to='/checkout'>
                                        <Button color='yellow'>Checkout</Button>
                                    </Link>
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Footer>
                    </Table>
                )}
            </Container>
        )
    }
}


export default OrderSummary