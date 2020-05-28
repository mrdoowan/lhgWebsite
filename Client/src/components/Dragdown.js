import React from 'react';
// react-bootstrap
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

export default function DragDown({ list, basePath, type='', title='Items' }) {

    return (
        <DropdownButton id={`${type}-dragdown`} title={title}>
        {list.map((item) => (
            <Dropdown.Item href={`${basePath}/${item.ShortName}`}>{item.ItemName}</Dropdown.Item>
        ))}
        </DropdownButton>
    )
}