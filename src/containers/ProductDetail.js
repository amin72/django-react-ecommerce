import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import {
    Button,
    Card,
    Grid,
    Icon,
    Image,
    Label,
    Container,
    Segment,
    Dimmer,
    Loader,
    Message,
    Item,
    Header
} from 'semantic-ui-react'

import axios from 'axios'
import { authAxios } from '../utils'

import { fetchCart } from '../store/actions/cart'
import { BASE_URL, PRODUCT_DETAIL_URL, ADD_TO_CART_URL } from '../constants'


class ProductList extends Component {

    state = {
        loading: false,
        error: null,
        date: null
    }

    componentDidMount() {
        this.handleFetchItem()
    }

    handleFetchItem = () => {
        this.setState({
            loading: true
        })

        const { params } = this.props.match
        axios.get(PRODUCT_DETAIL_URL(params.productID))
            .then(res => {
                this.setState({
                    data: res.data,
                    loading: false
                })
            }).catch(err => {
                this.setState({
                    error: err,
                    loading: false
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
        const item = data

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

                {item && (
                    <Grid columns={2} divided>
                        <Grid.Row>
                            <Grid.Column>
                                <Card
                                    fluid
                                    image={item.image}
                                    header={item.title}
                                    meta={
                                        <Fragment>
                                            {item.category}
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

                                        </Fragment>
                                    }
                                    description={item.description}
                                    extra={(
                                        <Fragment>
                                            <Button
                                                fluid
                                                color='yellow'
                                                floated='right'
                                                icon
                                                labelPosition="right"
                                                onClick={() => this.handleAddToCart(item.slug)}
                                            >
                                                Add to card
                                                <Icon name='cart plus' />
                                            </Button>
                                        </Fragment>
                                    )}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Header as="h2">Try different variations</Header>

                                {data.variations && (
                                    data.variations.map(v => (
                                        <Fragment>
                                            <Header as="h3">{v.name}</Header>
                                            <Item.Group divided key={v.id}>
                                                {v.item_variations.map(item_v => (
                                                    <Fragment>

                                                        <Item key={item_v.id}>
                                                            {item_v.attachment && (
                                                                <Item.Image
                                                                    size='tiny'
                                                                    src={`${BASE_URL}${item_v.attachment}`}
                                                                />
                                                            )}
                                                            <Item.Content
                                                                verticalAlign='middle'
                                                            >
                                                                {item_v.value}
                                                            </Item.Content>
                                                        </Item>
                                                    </Fragment>
                                                ))}
                                            </Item.Group>
                                        </Fragment>
                                    ))
                                )}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                )}
            </Container >
        )
    }
}


const mapDispatchToProps = dispatch => {
    return {
        fetchCart: () => dispatch(fetchCart())
    }
}


export default withRouter(connect(
    null, mapDispatchToProps)(ProductList))
