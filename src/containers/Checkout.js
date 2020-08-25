import React, { Component, Fragment } from 'react'
import {
    Button,
    Container,
    Divider,
    Dimmer,
    Form,
    Header,
    Input,
    Item,
    Loader,
    Label,
    Message,
    Segment,
    Select
} from 'semantic-ui-react';
import { authAxios } from '../utils'
import {
    CHECKOUT_URL,
    ORDER_SUMNARY_URL,
    ADD_COUPON_URL,
    ADDRESS_LIST_URL
} from '../constants'
import {
    CardElement,
    Elements,
    ElementsConsumer,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Link, withRouter } from 'react-router-dom';


class OrderPreview extends Component {

    render() {
        const { data } = this.props

        return (
            <Fragment>
                {data && (
                    <Fragment>
                        <Item.Group relaxed>
                            {data.order_items.map((order_item, i) => (
                                <Item key={order_item.id}>
                                    <Item.Image size='tiny' src={`http://127.0.0.1:8000${order_item.item.image}`} />

                                    <Item.Content verticalAlign='middle'>
                                        <Item.Header as='a'>
                                            {order_item.quantity} x {order_item.item.title}
                                        </Item.Header>
                                    </Item.Content>
                                    <Item.Extra>
                                        <Label>Price: ${order_item.final_price}</Label>
                                    </Item.Extra>
                                </Item>
                            ))}
                        </Item.Group>

                        <Item.Group>
                            <Item>
                                <Item.Content>
                                    <Item.Header>Order Total: ${data.total}</Item.Header>
                                    {data.coupon && (
                                        <Label color='green'>
                                            Current coupon: {data.coupon.code} for {data.coupon.amount}
                                        </Label>
                                    )}
                                </Item.Content>
                            </Item>
                        </Item.Group>
                    </Fragment>
                )}
            </Fragment>
        )
    }
}


class CouponForm extends Component {

    state = {
        code: ''
    }

    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleSubmit = e => {
        const { code } = this.state
        this.props.handleAddCoupon(e, code)
        this.setState({
            code: '',
            loading: false
        })
    }

    render() {
        const { code } = this.state

        return (
            <Form onSubmit={this.handleSubmit}>
                <Form.Field>
                    <label>Coupon Code</label>
                    <Input
                        name="code"
                        onChange={this.handleChange}
                        value={code}
                        placeholder='Enter a coupon...' />
                </Form.Field>
                <Button
                    type="submit"
                    style={{ marginTop: '10px' }}>
                    Submit
                </Button>
            </Form>
        )
    }
}


class CheckoutForm extends React.Component {

    state = {
        loading: false,
        error: null,
        success: false,
        stripe: null,
        data: null,
        billingAddresses: [],
        shippingAddresses: [],
        selectedBillingAddress: '',
        selectedShippingAddress: ''
    }

    componentDidMount() {
        this.handleFetchOrder()
        this.handleFetchBillingAddresses()
        this.handleFetchShippingAddresses()
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        this.setState({
            loading: true
        })

        const { stripe, elements } = this.props;

        if (!stripe || !elements) {
            // Stripe.js has not loaded yet. Make sure to disable
            // form submission until Stripe.js has loaded.
            return;
        }

        const card = elements.getElement(CardElement);

        stripe.createToken(card).then(result => {
            if (result.error) {
                this.setState({
                    error: result.error.message,
                    loading: false
                })
            } else {
                this.setState({
                    error: null
                })
                const { selectedBillingAddress, selectedShippingAddress } = this.state
                authAxios.post(CHECKOUT_URL, {
                    stripeToken: result.token.id,
                    selectedBillingAddress, selectedShippingAddress
                })
                    .then(res => {
                        this.setState({
                            loading: false,
                            success: true
                        })
                    })
                    .catch(err => {
                        this.setState({
                            loading: false,
                            error: err
                        })
                    })
            }
        })
    };

    handleFetchOrder = () => {
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
                    this.props.history.push("/products")
                } else {
                    this.setState({
                        error: err,
                        loading: false
                    })
                }
            })
    }

    handleAddCoupon = (e, code) => {
        e.preventDefault()

        this.setState({
            loading: true
        })

        authAxios.post(ADD_COUPON_URL, { code })
            .then(res => {
                this.setState({
                    loading: false,
                })
                this.handleFetchOrder()
            })
            .catch(err => {
                this.setState({
                    loading: false,
                    error: err
                })
            })
    }

    handleFetchBillingAddresses = () => {
        this.setState({
            loading: true
        })

        const { activeItem } = this.state

        // fetch user addresses
        authAxios.get(ADDRESS_LIST_URL('B'))
            .then(res => {
                this.setState({
                    billingAddresses: res.data.map(address => {
                        return {
                            key: address.id,
                            text: `${address.street_address}, ${address.apartment_address}, ${address.country}`,
                            value: address.id
                        }
                    }),
                    selectedBillingAddress: this.handleGetDefaultAddress(res.data),
                    loading: false
                })
            }).catch(err => {
                this.setState({
                    error: err,
                    loading: false
                })
            })
    }

    handleFetchShippingAddresses = async () => {
        this.setState({
            loading: true
        })

        const { activeItem } = this.state

        // fetch user addresses
        authAxios.get(ADDRESS_LIST_URL('S'))
            .then(res => {
                this.setState((state, props) => {
                    return {
                        shippingAddresses: res.data.map(address => {
                            return {
                                key: address.id,
                                text: `${address.street_address}, ${address.apartment_address}, ${address.country}`,
                                value: address.id
                            }
                        }),
                        selectedShippingAddress: this.handleGetDefaultAddress(res.data),
                        loading: false
                    }
                })
            }).catch(err => {
                this.setState({
                    error: err,
                    loading: false
                })
            })
    }

    handleSelectChange = (e, { name, value }) => {
        this.setState({
            [name]: value
        })
    }

    handleGetDefaultAddress = addresses => {
        const filteredAddresses = addresses.filter(address => address.default === true)
        return filteredAddresses.length > 0 ? filteredAddresses[0].id : ''
    }

    render() {
        const { data, error, loading, success, billingAddresses,
            shippingAddresses, selectedBillingAddress,
            selectedShippingAddress } = this.state

        return (
            <div>
                {error && (
                    <Message negative>
                        <Message.Header>Your payment was unsuccessful</Message.Header>
                        <p>{JSON.stringify(error)}</p>
                    </Message>
                )}

                {loading && (
                    <Segment>
                        <Dimmer active inverted>
                            <Loader inverted>Loading</Loader>
                        </Dimmer>
                    </Segment>

                )}

                <OrderPreview data={data} />
                <Divider />
                <CouponForm handleAddCoupon={(e, code) => this.handleAddCoupon(e, code)} />
                <Divider />

                <Header>Select a billing address</Header>
                {billingAddresses.length > 0 ? (
                    <Select
                        fluid
                        clearable
                        selection
                        name='selectedBillingAddress'
                        value={selectedBillingAddress}
                        options={billingAddresses}
                        onChange={this.handleSelectChange}
                    />) : (
                        <p>You need to <Link to="/profile" >add a billing addresses</Link></p>
                    )}

                <Header>Select a shipping address</Header>
                {shippingAddresses.length > 0 ? (
                    <Select
                        fluid
                        clearable
                        selection
                        name='selectedShippingAddress'
                        value={selectedShippingAddress}
                        options={shippingAddresses}
                        onChange={this.handleSelectChange}
                    />) : (
                        <p>You need to <Link to="/profile" >add a shipping addresses</Link></p>
                    )}

                {billingAddresses.length < 1 || shippingAddresses.length < 1 ? (
                    <p>You need to add addresses before you can complete your purchage</p>
                ) : (
                        <Fragment>
                            <Header>Would you like to complete the purchase?</Header>
                            <Form onSubmit={this.handleSubmit}>
                                <CardElement />
                                {success && (
                                    <Message positive>
                                        <Message.Header>Your payment was successful</Message.Header>
                                        <p>
                                            Go to your <b>profile</b> to see your order delivery status.
                                        </p>
                                    </Message>
                                )}
                                <Button
                                    primary
                                    loading={loading}
                                    disabled={loading}
                                    type="submit"
                                    style={{ marginTop: '20px' }}
                                >
                                    Pay
                            </Button>
                            </Form>
                        </Fragment>
                    )}
            </div>
        );
    }
}


const CheckoutFormWithRouter = withRouter(CheckoutForm)
const stripePromise = loadStripe('pk_test_q5g16dlUVvSaKuIkx9CzjdnI004U0kcgIM')

const Checkout = () => (
    <Elements stripe={stripePromise}>
        <Container text>
            <div>
                <Header as="h1">Complete your order</Header>
                <ElementsConsumer>
                    {({ elements, stripe }) => (
                        <CheckoutFormWithRouter elements={elements} stripe={stripe} />
                    )}
                </ElementsConsumer>
            </div>
        </Container >
    </Elements>
);

export default Checkout;
