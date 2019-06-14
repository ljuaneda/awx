import React from 'react';
import { mountWithContexts, waitForElement } from '../../../../enzymeHelpers';
import OrganizationDetail from '../../../../../src/pages/Organizations/screens/Organization/OrganizationDetail';
import { OrganizationsAPI } from '../../../../../src/api';

jest.mock('../../../../../src/api');

describe('<OrganizationDetail />', () => {
  const mockOrganization = {
    name: 'Foo',
    description: 'Bar',
    custom_virtualenv: 'Fizz',
    max_hosts: '0',
    created: 'Bat',
    modified: 'Boo',
    summary_fields: {
      user_capabilities: {
        edit: true
      }
    }
  };
  const mockInstanceGroups = {
    data: {
      results: [
        { name: 'One', id: 1 },
        { name: 'Two', id: 2 }
      ]
    }
  };

  beforeEach(() => {
    OrganizationsAPI.readInstanceGroups.mockResolvedValue(mockInstanceGroups);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initially renders succesfully', () => {
    mountWithContexts(<OrganizationDetail organization={mockOrganization} />);
  });

  test('should request instance groups from api', () => {
    mountWithContexts(<OrganizationDetail organization={mockOrganization} />);
    expect(OrganizationsAPI.readInstanceGroups).toHaveBeenCalledTimes(1);
  });

  test('should handle setting instance groups to state', async (done) => {
    const wrapper = mountWithContexts(
      <OrganizationDetail organization={mockOrganization} />
    );
    const component = await waitForElement(wrapper, 'OrganizationDetail');
    expect(component.state().instanceGroups).toEqual(mockInstanceGroups.data.results);
    done();
  });

  test('should render Details', async (done) => {
    const wrapper = mountWithContexts(<OrganizationDetail organization={mockOrganization} />);
    const testParams = [
      { label: 'Name', value: 'Foo' },
      { label: 'Description', value: 'Bar' },
      { label: 'Ansible Environment', value: 'Fizz' },
      { label: 'Created', value: 'Bat' },
      { label: 'Last Modified', value: 'Boo' },
      { label: 'Max Hosts', value: '0' },
    ];
    // eslint-disable-next-line no-restricted-syntax
    for (const { label, value } of testParams) {
      // eslint-disable-next-line no-await-in-loop
      const detail = await waitForElement(wrapper, `Detail[label="${label}"]`);
      expect(detail.find('dt').text()).toBe(label);
      expect(detail.find('dd').text()).toBe(value);
    }
    done();
  });

  test('should show edit button for users with edit permission', async (done) => {
    const wrapper = mountWithContexts(<OrganizationDetail organization={mockOrganization} />);
    const editButton = await waitForElement(wrapper, 'OrganizationDetail Button');
    expect(editButton.text()).toEqual('Edit');
    expect(editButton.prop('to')).toBe('/organizations/undefined/edit');
    done();
  });

  test('should hide edit button for users without edit permission', async (done) => {
    const readOnlyOrg = { ...mockOrganization };
    readOnlyOrg.summary_fields.user_capabilities.edit = false;
    const wrapper = mountWithContexts(<OrganizationDetail organization={readOnlyOrg} />);
    await waitForElement(wrapper, 'OrganizationDetail');
    expect(wrapper.find('OrganizationDetail Button').length).toBe(0);
    done();
  });
});
