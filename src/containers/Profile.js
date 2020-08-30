import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import {
    Button,
    Card,
    Divider,
    Form,
    Grid,
    Header,
    Menu,
    Message,
    Select,
    Label
} from 'semantic-ui-react'

import axios from 'axios'
import { authAxios } from '../utils'
import {
    ADDRESS_LIST_URL,
    ADDRESS_CREATE_URL,
    ADDRESS_UPDATE_URL,
    ADDRESS_DELETE_URL,
    COUNTRY_LIST_URL
} from '../constants'


// menu names
const billingAddress = "Billing Address"
const physicalAddress = "Physical Address"
const paymentHistory = "Payment history"
const UPDATE_FORM = 'UPDATE_FORM'
const CREATE_FORM = 'CREATE_FORM'


class AddressForm extends Component {
    state = {
        error: null,
        success: false,
        saving: false,
        formData: {
            apartment_address: '',
            country: '',
            default: false,
            street_address: '',
            zip: ''
        }
    }

    componentDidMount() {
        const { formType, address } = this.props

        if (formType === UPDATE_FORM) {
            this.setState({
                formData: address
            })
        }
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

    handleSubmit = e => {
        e.preventDefault()
        this.setState({
            saving: true
        })

        const { formType } = this.props
        if (formType === UPDATE_FORM) {
            this.handleUpdateAddress()
        } else {
            this.handleCreateAddress()
        }
    }

    handleCreateAddress = () => {
        const { formData } = this.state
        const { activeItem } = this.props

        authAxios.post(ADDRESS_CREATE_URL, {
            ...formData,
            address_type: activeItem === billingAddress ? 'B' : 'S'
        }).then(res => {
            this.setState(state => {
                return {
                    saving: false,
                    success: true,
                    formData: {
                        ...state.formData,
                        default: false
                    }
                }
            })
            // callback to fetch new addresses
            this.props.callback()
        }).catch(err => {
            this.setState({
                error: err
            })
        })
    }

    handleUpdateAddress = () => {
        const { formData } = this.state
        const { activeItem } = this.props

        authAxios.put(ADDRESS_UPDATE_URL(formData.id), {
            ...formData,
            address_type: activeItem === billingAddress ? 'B' : 'S'
        }).then(res => {
            this.setState(state => {
                return {
                    saving: false,
                    success: true,
                    formData: {
                        ...state.formData,
                        default: false
                    }
                }
            })
            // callback to fetch upated addresses
            this.props.callback()
        }).catch(err => {
            this.setState({
                error: err
            })
        })
    }

    render() {
        const { error, success, saving, formData } = this.state
        const { countries } = this.props

        return (
            <Form onSubmit={this.handleSubmit} success={success} error={error}>
                <Form.Input
                    required
                    name='street_address'
                    placeholder='Street address'
                    onChange={this.handleChange}
                    value={formData.street_address || ''}
                />
                <Form.Input
                    required
                    name='apartment_address'
                    placeholder='Apartment address'
                    onChange={this.handleChange}
                    value={formData.apartment_address}
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
                        value={formData.country}
                    />
                </Form.Field>
                <Form.Input
                    required
                    name='zip'
                    placeholder='Zip code'
                    onChange={this.handleChange}
                    value={formData.zip || ''}
                />
                <Form.Checkbox
                    name='default'
                    label='Make this default address?'
                    onChange={this.handleToggleDefault}
                    checked={formData.default}
                />
                {success && (
                    <Message
                        success
                        header='Success!'
                        content="Your address was saved"
                    />

                )}
                {error && (
                    <Message
                        error
                        header='There was an error'
                        content={JSON.stringify(error)}
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
        )
    }
}


class Profile extends Component {

    state = {
        activeItem: billingAddress,
        addresses: [],
        countries: [],
        selectedAddress: null,

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
        const { activeItem } = this.state

        // fetch user addresses
        authAxios.get(ADDRESS_LIST_URL(activeItem === billingAddress ? 'B' : 'S'))
            .then(res => {
                this.setState({
                    addresses: res.data,
                })
            }).catch(err => {
                this.setState({
                    error: err,
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

    handleSelectAddress = address => {
        this.setState({
            selectedAddress: address
        })
    }

    handleDeleteAddress = addressID => {
        authAxios.delete(ADDRESS_DELETE_URL(addressID))
            .then(res => {
                this.handleCallback()
            }).catch(err => {
                this.setState({
                    error: err,
                })
            })

    }

    handleCallback = () => {
        this.handleFetchAddresses()
        this.setState({
            selectedAddress: null
        })
    }

    render() {
        const { activeItem, addresses, countries, selectedAddress } = this.state
        const { isAuthenticated } = this.props

        if (!isAuthenticated) {
            return <Redirect to="/login" />
        }

        return (
            <Grid container columns={2} divided>
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
                            <Menu.Item
                                name="Payment history"
                                active={activeItem === paymentHistory}
                                onClick={this.handleItemClick}
                            />
                        </Menu>
                    </Grid.Column>
                    <Grid.Column width={10}>
                        <Header>
                            {`Update your ${activeItem === billingAddress ?
                                'billing' : 'shipping'}
                                 address`}
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
                                        <Card.Content extra>
                                            <Button
                                                color='yellow'
                                                onClick={() => this.handleSelectAddress(address)}>
                                                Update
                                            </Button>
                                            <Button
                                                onClick={() => this.handleDeleteAddress(address.id)}
                                                color='red'
                                            >
                                                Delete
                                            </Button>
                                        </Card.Content>
                                    </Card>
                                )
                            })}
                        </Card.Group>
                        {addresses.length > 0 && <Divider />}

                        {selectedAddress === null ? (
                            <AddressForm
                                activeItem={activeItem}
                                countries={countries}
                                formType={CREATE_FORM}
                                callback={this.handleCallback}
                            />
                        ) : null}
                        {selectedAddress && (
                            <AddressForm
                                activeItem={activeItem}
                                countries={countries}
                                formType={UPDATE_FORM}
                                address={selectedAddress}
                                callback={this.handleCallback}
                            />
                        )}
                    </Grid.Column>
                </Grid.Row>
            </Grid >
        )
    }
}

const mapStateToProps = state => {
    return {
        isAuthenticated: state.auth.token !== null
    }
}

export default connect(mapStateToProps)(Profile)