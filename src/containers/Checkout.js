import React, { Component } from 'react'
import { Container, Button, Form, Header, Message } from 'semantic-ui-react';
import { authAxios } from '../utils'
import { CHECKOUT_URL } from '../constants'
import {
    CardElement,
    Elements,
    ElementsConsumer,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';


class CheckoutForm extends React.Component {

    state = {
        loading: false,
        error: null,
        success: false,
        stripe: null
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
            console.log(result)

            if (result.error) {
                this.setState({
                    error: result.error.message,
                    loading: false
                })
            } else {
                authAxios.post(CHECKOUT_URL, { stripeToken: result.token.id })
                    .then(res => (
                        this.setState({
                            loading: false,
                            success: true
                        })
                    ))
                    .catch(err => (
                        this.setState({
                            loading: false,
                            error: err
                        })
                    ))
            }
        })
    };


    render() {
        const { stripe } = this.props;
        const { error, loading, success } = this.state

        return (
            <div>
                {error && (
                    <Message negative>
                        <Message.Header>Your payment was unsuccessful</Message.Header>
                        <p>{JSON.stringify(error)}</p>
                    </Message>
                )}

                {success && (
                    <Message positive>
                        <Message.Header>Your payment was successful</Message.Header>
                        <p>
                            Go to your <b>profile</b> to see your order delivery status.
                      </p>
                    </Message>
                )}

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
