import React, { Component } from 'react'
import {
    Card,
    Dimmer,
    Divider,
    Form,
    Grid,
    Header,
    Loader,
    Menu,
    Message,
    Segment,
    Select,
    Label
} from 'semantic-ui-react'

import axios from 'axios'
import { authAxios } from '../utils'
import {
    ADDRESS_LIST_URL,
    ADDRESS_CREATE_URL,
    COUNTRY_LIST_URL
} from '../constants'


// menu names
const billingAddress = "Billing Address"
const physicalAddress = "Physical Address"


class Profile extends Component {

    state = {
        activeItem: billingAddress,
        addresses: [],
        formData: {
            default: false
        },
        countries: [],
        loading: false,
        error: null,
        success: false,
        saving: false
    }

    componentDidMount = () => {
        this.handleFetchAddresses()
        this.handleFetchCountries()
    }

    handleItemClick = (e, { name }) => {
        this.setState({
            activeItem: name
        }, () => {
            this.handleFetchAddresses()
        })
    }

    handleFetchAddresses = () => {
        this.setState({
            loading: true
        })

        const { activeItem } = this.state

        // fetch user addresses
        authAxios.get(ADDRESS_LIST_URL(activeItem === billingAddress ? 'B' : 'S'))
            .then(res => {
                this.setState({
                    addresses: res.data,
                    loading: false
                })
            }).catch(err => {
                this.setState({
                    error: err,
                    loading: false
                })
            })
    }

    handleChange = e => {
        const { formData } = this.state
        const updatedFormData = {
            ...formData,
            [e.target.name]: e.target.value
        }

        this.setState({
            formData: updatedFormData
        })
    }

    handleSelectChange = (e, { name, value }) => {
        const { formData } = this.state
        const updatedFormData = {
            ...formData,
            [name]: value
        }

        this.setState({
            formData: updatedFormData
        })
    }

    handleToggleDefault = (e, { value }) => {
        const { formData } = this.state
        const updatedFormData = {
            ...formData,
            default: !formData.default
        }

        this.setState({
            formData: updatedFormData
        })
    }

    handleCreateAddress = e => {
        e.preventDefault()
        this.setState({
            saving: true
        })
        const { activeItem, formData } = this.state

        authAxios.post(ADDRESS_CREATE_URL, {
            ...formData,
            address_type: activeItem === billingAddress ? 'B' : 'S'
        }).catch(res => {
            this.setState({
                saving: false,
                success: true
            })
        }).catch(err => {
            this.setState({
                error: err
            })
        })
    }

    handleFetchCountries = () => {
        // fetch countries
        axios.get(COUNTRY_LIST_URL)
            .then(res => {
                this.setState({
                    countries: this.handleFormatCountries(res.data),
                })
            }).catch(err => {
                this.setState({
                    error: err,
                })
            })
    }

    handleFormatCountries = countries => {
        const keys = Object.keys(countries)
        return keys.map(k => {
            return {
                key: k,
                text: countries[k],
                value: k
            }
        })
    }

    render() {
        const { activeItem, loading, error, addresses, countries, saving, success } = this.state

        return (
            <Grid container columns={2} divided>
                <Grid.Row columns={1}>
                    {error && (
                        <Message
                            error
                            header='There was an error'
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
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={6}>
                        <Menu pointing vertical fluid>
                            <Menu.Item
                                name={billingAddress}
                                active={activeItem === billingAddress}
                                onClick={this.handleItemClick}
                            />
                            <Menu.Item
                                name={physicalAddress}
                                active={activeItem === physicalAddress}
                                onClick={this.handleItemClick}
                            />
                        </Menu>
                    </Grid.Column>
                    <Grid.Column width={10}>
                        <Header>
                            {`Update your ${activeItem === billingAddress ? 'billing' : 'shipping'} address`}
                        </Header>
                        <Divider />
                        <Card.Group>
                            {addresses.map(address => {
                                return (
                                    <Card key={address.id}>
                                        <Card.Content>
                                            {address.default && (
                                                <Label as='a' color='teal' ribbon='right'>
                                                    Default
                                                </Label>
                                            )}
                                            <Card.Header>{address.street_address}, {address.apartment_address}</Card.Header>
                                            <Card.Meta>{address.country}</Card.Meta>
                                            <Card.Description>
                                                {address.zip}
                                            </Card.Description>
                                        </Card.Content>
                                    </Card>
                                )
                            })}
                        </Card.Group>
                        {addresses.length > 0 && <Divider />}
                        <Form onSubmit={this.handleCreateAddress} success={success}>
                            <Form.Input
                                required
                                name='street_address'
                                placeholder='Street address'
                                onChange={this.handleChange}
                            />
                            <Form.Input
                                required
                                name='apartment_address'
                                placeholder='Apartment address'
                                onChange={this.handleChange}
                            />
                            <Form.Field>
                                <Select
                                    loading={countries.length < 1}
                                    required
                                    clearable
                                    search
                                    fluid
                                    name='country'
                                    options={countries}
                                    placeholder='Country'
                                    onChange={this.handleSelectChange}
                                />
                            </Form.Field>
                            <Form.Input
                                required
                                name='zip'
                                placeholder='Zip code'
                                onChange={this.handleChange}
                            />
                            <Form.Checkbox
                                name='default'
                                label='Make this default address?'
                                onChange={this.handleToggleDefault}
                            />
                            {success && (
                                <Message
                                    success
                                    header='Success!'
                                    content="Your address was saved"
                                />

                            )}
                            <Form.Button
                                fluid
                                primary
                                disabled={saving}
                                loading={saving}
                            >
                                Save
                            </Form.Button>
                        </Form>
                    </Grid.Column>
                </Grid.Row>
            </Grid >
        )
    }
}

export default Profile