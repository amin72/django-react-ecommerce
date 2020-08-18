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
    Segment
} from 'semantic-ui-react';
import { authAxios } from '../utils'
import { CHECKOUT_URL, ORDER_SUMNARY_URL, ADD_COUPON_URL, X_URL } from '../constants'
import {
    CardElement,
    Elements,
    ElementsConsumer,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Axios from 'axios';


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
        this.setState({ code: '' })
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
        data: null
    }

    componentDidMount() {
        this.handelFetchOrder()
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
                authAxios.post(CHECKOUT_URL, { stripeToken: result.token.id })
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
                if (err.response.status) {
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
                this.handelFetchOrder()
            })
            .catch(err => {
                this.setState({
                    loading: false,
                    error: err
                })
            })
    }

    render() {
        const { data, error, loading, success } = this.state

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

                {success && (
                    <Message positive>
                        <Message.Header>Your payment was successful</Message.Header>
                        <p>
                            Go to your <b>profile</b> to see your order delivery status.
                      </p>
                    </Message>
                )}

                <OrderPreview data={data} />
                <Divider />
                <CouponForm handleAddCoupon={(e, code) => this.handleAddCoupon(e, code)} />
                <Divider />

                <Header>Would you like to complete the purchase?</Header>
                <Form onSubmit={this.handleSubmit}>
                    <CardElement />
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
            </div>
        );
    }
}


const stripePromise = loadStripe('pk_test_q5g16dlUVvSaKuIkx9CzjdnI004U0kcgIM');

const Checkout = () => (
    <Elements stripe={stripePromise}>
        <Container text>
            <div>
                <Header as="h1">Complete your order</Header>
                <ElementsConsumer>
                    {({ elements, stripe }) => (
                        <CheckoutForm elements={elements} stripe={stripe} />
                    )}
                </ElementsConsumer>
            </div>
        </Container >
    </Elements>
);

export default Checkout;
