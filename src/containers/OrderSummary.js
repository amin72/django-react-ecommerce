import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
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
    Icon
} from 'semantic-ui-react'
import {
    ORDER_SUMNARY_URL,
    ORDER_ITEM_DELETE_URL,
    ADD_TO_CART_URL,
    ORDER_ITEM_QUANTITY_UPDATE_URL
} from '../constants';
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

    renderVariations = orderItem => {
        let text = ''
        orderItem.item_variations.forEach(item_v => {
            text += `${item_v.variation.name}: ${item_v.value} `
        })
        return text
    }

    handleRemoveItem = itemId => {
        this.setState({
            loading: true
        })

        authAxios.delete(ORDER_ITEM_DELETE_URL(itemId))
            .then(res => {
                // fetch order again (deleted item is gone)
                this.handelFetchOrder()
            }).catch(err => {
                this.setState({
                    error: err
                })
            })
    }

    handleFormatData = itemVariations => {
        return Object.keys(itemVariations).map(key => {
            return itemVariations[key].id
        })
    }

    handleAddToCart = (slug, itemVariations) => {
        this.setState({
            loading: true
        })

        const variations = this.handleFormatData(itemVariations)

        authAxios.post(ADD_TO_CART_URL, { slug, variations })
            .then(res => {
                this.handelFetchOrder()
                this.setState({
                    loading: false
                })
            }).catch(err => {
                this.setState({
                    error: err,
                    loading: false
                })
            })
    }

    handleRemoveQuantityFromCart = slug => {
        this.setState({
            loading: true
        })

        authAxios.post(ORDER_ITEM_QUANTITY_UPDATE_URL, { slug })
            .then(res => {
                this.handelFetchOrder()
                this.setState({
                    loading: false
                })
            }).catch(err => {
                this.setState({
                    error: err,
                    loading: false
                })
            })
    }

    render() {
        const { data, error, loading } = this.state
        const { isAuthenticated } = this.props

        if (!isAuthenticated) {
            return <Redirect to="/login" />
        }

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
                            {data && data.order_items.map((orderItem, i) => (
                                <Table.Row key={orderItem.id}>
                                    <Table.Cell>{i + 1}</Table.Cell>
                                    <Table.Cell>
                                        {orderItem.item.title} - {this.renderVariations(orderItem)}
                                    </Table.Cell>
                                    <Table.Cell>${orderItem.item.price}</Table.Cell>
                                    <Table.Cell textAlign='center'>
                                        <Icon
                                            name='minus'
                                            color='red'
                                            style={{ float: 'left', cursor: 'pointer' }}
                                            onClick={() =>
                                                this.handleRemoveQuantityFromCart(orderItem.item.slug)
                                            }
                                        />
                                        {orderItem.quantity}
                                        <Icon
                                            name='plus'
                                            color='green'
                                            style={{ float: 'right', cursor: 'pointer' }}
                                            onClick={() =>
                                                this.handleAddToCart(orderItem.item.slug,
                                                    orderItem.item_variations)
                                            }
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        {orderItem.item.discount_price && (
                                            <Label color='green' ribbon>ON DISCOUNT</Label>
                                        )}
                                        ${orderItem.final_price}
                                        <Icon
                                            name='trash'
                                            color='red'
                                            style={{ float: 'right', cursor: 'pointer' }}
                                            onClick={() =>
                                                this.handleRemoveItem(orderItem.id)
                                            }
                                        />
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


const mapStateToProps = state => {
    return {
        isAuthenticated: state.auth.token !== null
    }
}

export default connect(mapStateToProps)(OrderSummary)