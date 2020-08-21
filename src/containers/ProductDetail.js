import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import {
    Button,
    Card,
    Container,
    Dimmer,
    Divider,
    Grid,
    Header,
    Form,
    Icon,
    Image,
    Item,
    Label,
    Loader,
    Message,
    Segment,
    Select,
} from 'semantic-ui-react'

import axios from 'axios'
import { authAxios } from '../utils'

import { fetchCart } from '../store/actions/cart'
import { BASE_URL, PRODUCT_DETAIL_URL, ADD_TO_CART_URL } from '../constants'


class ProductList extends Component {

    state = {
        loading: false,
        error: null,
        date: null,
        formVisible: false,
        formData: {}
    }

    componentDidMount() {
        this.handleFetchItem()
    }

    handleToggleForm = () => {
        const { formVisible } = this.state
        this.setState({
            formVisible: !formVisible
        })
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

        const { formData } = this.state
        const variations = this.handleFormatData(formData)

        authAxios.post(ADD_TO_CART_URL, { slug, variations })
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

    handleFormatData = formData => {
        return Object.keys(formData).map(key => {
            return formData[key]
        })
    }

    handleChange = (e, { name, value }) => {
        const { formData } = this.state
        const updatedFormDate = {
            ...formData,
            [name]: value
        }

        this.setState({
            formData: updatedFormDate
        })
    }

    render() {
        const { loading, error, data, formVisible, formData } = this.state
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
                                                onClick={this.handleToggleForm}
                                            >
                                                Add to card
                                                <Icon name='cart plus' />
                                            </Button>
                                        </Fragment>
                                    )}
                                />
                                {formVisible && (
                                    <Fragment>
                                        <Divider />
                                        <Form>
                                            {data.variations.map(v => {
                                                const name = v.name.toLowerCase()

                                                return (
                                                    <Form.Field key={v.id}>
                                                        <Select
                                                            name={name}
                                                            onChange={this.handleChange}
                                                            options={v.item_variations.map(item_v => (
                                                                {
                                                                    key: item_v.id,
                                                                    text: item_v.value,
                                                                    value: item_v.id
                                                                }
                                                            ))}

                                                            placeholder={`Choose a ${name}`}
                                                            selection
                                                            value={formData[name]}
                                                        />
                                                    </Form.Field>
                                                )
                                            })}
                                            < Form.Button onClick={() => this.handleAddToCart(item.slug)}>
                                                Submit
                                            </Form.Button>
                                        </Form>
                                    </Fragment>
                                )}
                            </Grid.Column>
                            <Grid.Column>
                                <Header as="h2">Try different variations</Header>

                                {data.variations && (
                                    data.variations.map(v => (
                                        <Fragment key={v.id}>
                                            <Header as="h3">{v.name}</Header>
                                            <Item.Group divided>
                                                {v.item_variations.map(item_v => (
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
                                                ))}
                                            </Item.Group>
                                        </Fragment>
                                    ))
                                )}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                )
                }
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
