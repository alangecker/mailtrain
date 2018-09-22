'use strict';

import React, {Component} from 'react';
import {translate} from 'react-i18next';
import {Icon} from '../lib/bootstrap-components';
import {
    NavButton,
    requiresAuthenticatedUser,
    Title,
    Toolbar,
    withPageHelpers
} from '../lib/page';
import {
    withAsyncErrorHandler,
    withErrorHandling
} from '../lib/error-handling';
import {Table} from '../lib/table';
import axios from '../lib/axios';
import moment from 'moment';
import {getMailerTypes} from './helpers';
import {checkPermissions} from "../lib/permissions";


@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.mailerTypes = getMailerTypes(props.t);

        this.state = {};
    }

    @withAsyncErrorHandler
    async fetchPermissions() {
        const result = await checkPermissions({
            createSendConfiguration: {
                entityTypeId: 'namespace',
                requiredOperations: ['createSendConfiguration']
            }
        });

        this.setState({
            createPermitted: result.data.createSendConfiguration
        });
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('Description') },
            { data: 3, title: t('Type'), render: data => this.mailerTypes[data].typeName },
            { data: 4, title: t('Created'), render: data => moment(data).fromNow() },
            { data: 5, title: t('Namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[6];

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('Edit')}/>,
                            link: `/send-configurations/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share-alt" title={t('Share')}/>,
                            link: `/send-configurations/${data[0]}/share`
                        });
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                {this.state.createPermitted &&
                    <Toolbar>
                        <NavButton linkTo="/send-configurations/create" className="btn-primary" icon="plus" label={t('Create Send Configuration')}/>
                    </Toolbar>
                }

                <Title>{t('Send Configurations')}</Title>

                <Table withHeader dataUrl="rest/send-configurations-table" columns={columns} />
            </div>
        );
    }
}