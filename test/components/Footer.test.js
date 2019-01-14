import React from 'react';
import { expect } from 'chai';
import { render,configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

import Footer from '../../components/Footer';

describe('<Footer />', () => {
    it('renders three `.foo-bar`s', () => {
        const wrapper = render(<Footer />);
        expect(wrapper.find('.content').length).to.equal(1);
    });

});