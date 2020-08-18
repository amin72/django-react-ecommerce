import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Button,
    Icon,
    Image,
    Item,
    Label,
    Container,
    Segment,
    Dimmer,
    Loader,
    Message
} from 'semantic-ui-react'

import axios from 'axios'
import { authAxios } from '../utils'

import { fetchCart } from '../store/actions/cart'
import { PRODUCT_LIST_URL, ADD_TO_CART_URL } from '../constants'


class ProductList extends Component {

    state = {
        loading: false,
        error: null,
        date: []
    }


    componentDidMount() {
        this.setState({
            loading: true
        })

        axios.get(PRODUCT_LIST_URL)
            .then(res => {
                this.setState({
                    data: res.data,
                    loading: false
                })
            }).catch(err => {
                this.setState({
                    error: err
                })
            })
    }


    handleAddToCart = slug => {
        this.setState({
            loading: true
        })

        authAxios.post(ADD_TO_CART_URL, { slug })
            .then(res => {
                this.props.fetchCart();
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
        const { loading, error, data } = this.state

        return (
            <Container>
                {error && (
                    <Message
                        error
                        header='There was some errors with your submission'
                        content={JSON.stringify(error)}
                    />
                )}

                {loading && (
                    <Segment>
                        <Dimmer active inverted>
                            <Loader inverted>Loading</Loader>
                        </Dimmer>

                        <Image src='/images/wireframe/short-paragraph.png' />
                    </Segment>

                )}

                <Item.Group divided>
                    {data && data.map(item => (
                        <Item key={item.slug}>
                            <Item.Image src={item.image} />
                            <Item.Content>
                                <Item.Header
                                    as='a'
                                    onClick={() => this.props.history.push(`/products/${item.id}`)}>
                                    {item.title}
                                </Item.Header>
                                <Item.Meta>
                                    <span className='cinema'>{item.category}</span>
                                </Item.Meta>
                                <Item.Description>{item.description}</Item.Description>
                                <Item.Extra>
                                    <Button primary floated='right' icon labelPosition="right" onClick={() => this.handleAddToCart(item.slug)} >
                                        Add to card
                                        <Icon name='cart plus' />
                                    </Button>
                                    {item.discount_price && (
                                        <Label
                                            color={
                                                item.label === "primary"
                                                    ? "blue"
                                                    : item.label === "secondary"
                                                        ? "green"
                                                        : "olive"
                                            }
                                        >
                                            {item.label}
                                        </Label>
                                    )}
                                    <Label>Price: ${item.price}</Label>
                                </Item.Extra>
                            </Item.Content>
                        </Item>
                    ))}
                </Item.Group>
            </Container >
        )
    }
}


const mapDispatchToProps = dispatch => {
    return {
        fetchCart: () => dispatch(fetchCart())
    }
}


export default connect(null, mapDispatchToProps)(ProductList)
